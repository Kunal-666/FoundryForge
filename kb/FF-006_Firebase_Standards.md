# Firebase Integration Standards

This document defines engineering standards for integrating Firebase services into production applications. It covers authentication patterns, Firestore data modeling, Storage, Hosting, Cloud Functions, security rules, indexing strategy, cost optimization, query design, and the trade-offs between real-time and batch operations. These standards apply to applications using Firebase as a primary or secondary backend, whether on web, mobile, or server-side platforms.

## Authentication Setup and Patterns

Firebase Authentication should be initialized at the application entry point and made available through a context provider. Do not initialize Firebase Auth multiple times in different components—create a single AuthContext at the root and consume it throughout the tree.

The standard pattern is to use the `onAuthStateChanged` observer to track authentication state. This listener fires on initialization and whenever the auth state changes, providing the current user or null. It should be registered once and cleaned up on unmount:

```typescript
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
```

This pattern ensures that the auth state is available before rendering any child components, preventing flash-of-unauthenticated-content.

Support multiple sign-in methods based on your application's audience. Email and password authentication is the baseline. For consumer-facing applications, add Google and Apple sign-in as a minimum. For enterprise applications, consider SAML or OIDC federation through Firebase Auth's custom auth provider. Social sign-ins reduce password management burdens and improve conversion rates on sign-up flows.

Handle auth errors gracefully. `signInWithEmailAndPassword` can throw errors with codes like `auth/user-not-found` and `auth/wrong-password`. These error messages should not reveal whether the email exists or the password was wrong; use a generic "Invalid email or password" message to prevent user enumeration attacks.

For custom claims, set them server-side using the Firebase Admin SDK after validating the user's role or permissions on your backend. Never set custom claims directly from client code. Custom claims are passed in the ID token and are available client-side via `user.getIdTokenResult()`, but use them for lightweight role checks (e.g., "is this user an admin?", "what plan tier does this user have?"). For fine-grained per-document permissions, rely on Firestore security rules rather than custom claims.

## Firestore Data Modeling

Firestore is a document-oriented NoSQL database. Data modeling in Firestore follows different principles than relational databases. You design your schema based on query patterns, not on normalized data relationships. The golden rule: model your data to match the queries your application will run, not the abstract shape of the data.

### Collections, Documents, and Subcollections

Organize data in collections of documents. Each document is a JSON-like object with a maximum size of 1 MiB. Use subcollections to represent one-to-many relationships that may grow large. The classic example is a blog with posts and comments:

```
posts (collection)
  {postId} (document)
    title: "My Post"
    content: "..."
    authorId: "user123"
    createdAt: timestamp
    comments (subcollection)
      {commentId} (document)
        text: "Great post!"
        authorId: "user456"
        createdAt: timestamp
```

Do not embed the comments array directly in the post document. Comments can grow unbounded, which would eventually exceed the 1 MiB document limit and cause slow reads as the entire post document is downloaded every time a comment is fetched.

For one-to-one relationships and small one-to-many relationships (fewer than 10 items), embedding is acceptable and often preferable. For example, a user's shipping address can be embedded in the user document rather than placed in a separate collection:

```typescript
interface User {
  name: string;
  email: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  // No separate addresses collection needed
}
```

Use reference fields (storing a document ID or path as a string) for many-to-many relationships. For example, a task management app might have users assigned to tasks. The task document stores an array of user IDs:

```typescript
interface Task {
  title: string;
  assignedTo: string[]; // Array of user document IDs
  createdBy: string;    // Single user document ID
}
```

This allows querying tasks assigned to a user without needing a join table. The trade-off is that you must manually resolve the user names and avatars on the client, often with a separate `getDoc` call for each reference.

### Index Planning

Firestore requires indexes for any query that combines multiple fields in a WHERE clause or uses inequality filters on different fields. Composite indexes are created in the Firebase Console, via the Firebase CLI, or through the `firestore.indexes.json` configuration file.

Plan your indexes before writing queries. Every query should have a corresponding composite index defined in your indexes configuration. The most common patterns that need composite indexes:

- Equality filter on one field and order on another: `where("status", "==", "active").orderBy("createdAt", "desc")`
- Range filter on one field and equality on another: `where("price", ">=", 10).where("category", "==", "books")`
- Multiple equality filters: `where("status", "==", "active").where("region", "==", "us")`

Firestore automatically indexes each field individually, so simple queries on a single field do not require manual index creation.

Monitor index usage in the Firebase Console. If a query requires a new index, Firestore returns an error with a direct link to create the index. In production, add the index to your `firestore.indexes.json` file and deploy it through your CI/CD pipeline rather than using the one-click console link, which may leave indexes undeployed in other environments.

Avoid creating too many indexes. Each index consumes storage and incurs write cost. If you find yourself creating indexes for many ad-hoc queries, reconsider your data model. A common cause of index proliferation is querying on fields that should be combined into a single synthetic field. For example, instead of querying with `where("year", "==", 2024).where("month", "==", 3)`, store a `yearMonth` field as "2024-03" and query with a single equality filter.

## Security Rules Principles

Firestore security rules are your primary line of defense. They run on every read and write operation and must be configured before your application goes to production.

The fundamental principle of security rules is **deny by default, grant by exception**. Your rules should not grant broad access and then restrict; they should start with `match /{document=**}` denying all access, then explicitly allow specific paths for specific conditions.

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }

    // Allow reading posts if the document is published
    match /posts/{postId} {
      allow read: if resource.data.status == 'published';
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

    // Users can read and write only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

Use `request.auth` to access the authenticated user's UID. Use `resource.data` to read the existing document data. Use `request.resource.data` to validate incoming data before a write. This last one is critical—you can enforce schema validation in rules:

```plaintext
allow create: if request.auth.uid == request.resource.data.authorId
              && request.resource.data.title is string
              && request.resource.data.title.size() > 0
              && request.resource.data.title.size() <= 200;
```

Do not rely on client-side validation for security. Security rules are the only guarantee that your data is protected.

## Storage and Hosting

Firebase Storage stores user-generated files like images, videos, and documents. The same deny-by-default philosophy applies to Storage security rules. Use signed URLs for sharing files with unauthenticated users rather than making storage buckets public.

When uploading files, use the `put` method with metadata that includes custom properties like `userId` and `contentType`. This metadata is available in Storage security rules for validation:

```typescript
const metadata = {
  customMetadata: {
    uploadedBy: user.uid,
    originalName: file.name,
  },
};
await uploadBytesResumable(storageRef, file, metadata);
```

Storage security rules can then validate:

```plaintext
match /user-uploads/{userId}/{allPaths=**} {
  allow write: if request.auth.uid == userId
               && request.resource.size < 10 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
}
```

Firebase Hosting serves static assets over a CDN. Configure caching headers in `firebase.json` to improve load times. For versioned assets (built by your bundler with content hashes in filenames), set `max-age: 31536000` (one year). For non-versioned assets like `index.html`, set `no-cache` so that users always get the latest version:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|woff|woff2)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" }
        ]
      }
    ]
  }
}
```

For single-page applications, configure rewrites in `firebase.json` so that all routes serve `index.html`:

```json
{
  "hosting": {
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

## Cloud Functions

Use Cloud Functions for operations that should not run on the client: sending emails, processing payments, generating thumbnails, updating derived data, and calling third-party APIs. The key principle is that Cloud Functions are an extension of your trusted server environment and have access to the Firebase Admin SDK.

Write functions that are idempotent. Network failures or timeout retries can cause a function to execute more than once. Use a unique identifier in the document or use Firestore transactions to ensure that duplicate invocations do not cause duplicate side effects:

```typescript
exports.processPayment = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    if (order.processed) {
      // Already processed, skip to ensure idempotency
      return null;
    }
    await snap.ref.update({ processed: true, processedAt: FieldValue.serverTimestamp() });
    // Process the payment...
  });
```

Use `functions.logger` for structured logging instead of `console.log`. This integrates with Cloud Logging and makes it easier to filter and search function logs in the Google Cloud Console.

Set memory and timeout values appropriate to each function's workload. Lightning-fast functions like webhook receivers or database triggers can use the default 128 MB and 60-second timeout. Image processing or heavy computation functions may need 512 MB or 1 GB and a 5-minute timeout. Over-provisioning memory increases cost unnecessarily.

## Cost Optimization

Firebase pricing is mostly based on operations performed, not on data stored. The biggest cost drivers are Firestore reads and writes, so optimizing those has the most impact.

Every document read costs one read operation, even if you only read a subset of its fields. To minimize reads:

1. **Denormalize selectively**. If a dashboard shows the count of comments on a post, store the comment count directly on the post document rather than reading all comments to count them. Update this counter using a Firestore transaction or a Cloud Function triggered on comment creation and deletion.

2. **Use collection group queries sparingly**. A collection group query that spans thousands of subcollections may read many documents. Structure your data so that the most common queries target a specific collection rather than a collection group.

3. **Paginate list views**. Never read an entire collection into memory. Use `limit`, `startAfter`, and `orderBy` to paginate results. Firestore bills per document read, so reading 500 documents that are not displayed wastes money and bandwidth.

4. **Cache on the client**. Use the Firestore SDK's built-in offline persistence for mobile apps. For web applications, consider using a client-side cache layer or React Query to avoid re-fetching data that has not changed.

5. **Avoid real-time listeners where polling suffices**. Real-time listeners (`onSnapshot`) keep an open connection and re-read documents on every change. For dashboards or reports that update every 30 seconds, use `getDocs` on a timer instead.

6. **Use `select()` to fetch only required fields**. Firestore bills per document read, not per field, but fetching large documents with many fields still consumes bandwidth and slows the client. When you only need a few fields, use `select('field1', 'field2')` to return a document with only those fields populated.

## Query Optimization

Firestore query performance scales with the size of the result set, not the size of the collection. A query that returns 10 documents is equally fast whether the collection has 100 or 10 million documents, as long as the query uses the correct indexes. This means you should never pre-optimize by splitting collections prematurely.

Use the following patterns for efficient queries:

- Always apply a `limit()` to list queries to prevent accidentally pulling thousands of documents.
- Use `orderBy` with the same field as the range filter. Firestore requires that the first `orderBy` field matches the field used in an inequality filter.
- Prefer `array-contains` over `array-contains-any` when querying for a single value. `array-contains-any` requires a composite index and is more expensive.
- Use `in` queries with a maximum of 10 values. If you need to query on more than 10 values, restructure the query or run multiple queries in parallel.
- Avoid `not-in` and `!=` queries when possible. They require composite indexes and may scan more documents than equivalent positive queries.

## Real-Time vs Batch Operations

Real-time listeners provide a responsive user experience but come with higher cost and complexity. Use them only when the UI truly needs live updates: collaborative editing, chat applications, live dashboards, and activity feeds. For data that changes infrequently or that the user views briefly, use one-time reads.

When using `onSnapshot`, always store the unsubscribe function and call it when the component unmounts or when the data is no longer needed. Failing to unsubscribe causes memory leaks and unnecessary reads:

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    query(collection(db, 'conversations'), where('participants', 'array-contains', userId)),
    (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(conversations);
    }
  );
  return unsubscribe;
}, [userId]);
```

For batch writes, use `writeBatch` to perform up to 500 operations atomically. This is essential for operations that must all succeed or all fail, such as transferring money between accounts or updating a post and incrementing its comment count simultaneously.

Use `runTransaction` when the operation depends on the current state of a document. For example, decrementing inventory stock requires reading the current stock level and checking it before writing. Transactions retry automatically on contention, so they handle concurrent updates safely:

```typescript
await runTransaction(db, async (transaction) => {
  const productRef = doc(db, 'products', productId);
  const productSnapshot = await transaction.get(productRef);
  if (!productSnapshot.exists()) {
    throw new Error('Product not found');
  }
  const currentStock = productSnapshot.data().stock;
  if (currentStock < quantity) {
    throw new Error('Insufficient stock');
  }
  transaction.update(productRef, { stock: currentStock - quantity });
});
```

Do not use transactions for operations that do not depend on existing document state. A simple write that sets a new document does not need a transaction; a plain `setDoc` is sufficient and cheaper.

Finally, Firestore has a maximum write rate of 10,000 writes per second on a collection (or 1 write per second on a document). If your application needs sustained high write throughput to a single document, consider using a distributed counter pattern with multiple sub-documents to distribute the write load.
