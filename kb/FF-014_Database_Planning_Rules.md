# Database Planning Rules

Database planning is the practice of designing data storage structures that align with application requirements, access patterns, scaling needs, and team capabilities. This document covers Firestore collection design, SQL normalization, relationship modeling, indexing strategies, query optimization, naming conventions, scalability rules, and complete example schemas for a SaaS product and an e-commerce platform. The guidance is implementation-agnostic where possible but provides platform-specific rules for Firestore and SQL databases where the differences matter.

## Foundational Principles

Every database design begins with understanding the application's query patterns, not its data structure. The most common mistake in database planning is modeling data in the database the way it exists in the real world, without considering how the application will read and write that data. A database design that perfectly mirrors the domain model but requires five joins or collection scans for every page load is not a good design.

Before writing any schema, list every page or feature in the application and write down the exact queries each one needs. For a product detail page, the queries might be: get product by ID, get product variants, get product reviews (paginated), get related products. For a user dashboard: get all projects for user ID, get recent activity for user ID, get unread notification count for user ID. These queries drive the schema design, not the other way around.

The second principle is that there is no universal best database. Firestore excels at real-time synchronization, mobile-friendly access, and rapid prototyping. SQL databases excel at complex queries, data integrity, and reporting. The best solution for many applications is a hybrid: use Firestore for real-time application data and a SQL database for analytics and reporting. The database planning process should not assume a single technology.

## Firestore Collection Design Principles

Firestore is a document-oriented, NoSQL database that organizes data into collections of documents. Each document is a lightweight record containing key-value pairs, and documents can contain subcollections for nested data. Firestore scales automatically and provides real-time listeners, but it has specific constraints that influence schema design.

The most important Firestore rule is: design collections to match your query patterns. Firestore does not support joins, and queries can only filter on fields within a single collection or use collection group queries across collections with the same name. This means you must denormalize data and structure collections so that each query can be satisfied by reading from a single collection or a small number of collections.

In Firestore, favor data duplication over computed joins. If a product detail page needs to show the product name, category, price, average rating, and review count, store the average rating and review count directly on the product document rather than computing them from the reviews subcollection. This means you must update the product document whenever a review is added or changed, but this write overhead is worth the read efficiency.

Use subcollections for data that is always accessed in the context of a parent document. Reviews are a good subcollection candidate because reviews are almost always queried for a specific product. However, do not nest subcollections more than two levels deep—Firestore becomes slow and awkward to query beyond that.

Avoid using arrays for data that needs atomic updates or individual access. Firestore arrays have limited querying capability and do not support operations like "remove element at index" without reading the entire array and writing it back. Use a subcollection or a map field instead.

Use composite indexes for queries that filter on multiple fields. Firestore automatically indexes every field, but queries that filter on multiple fields or combine equality filters with range filters require a composite index. Create composite indexes for every query pattern you identify during planning, not after you encounter an error in production.

## SQL Normalization Principles

SQL databases use normalization to eliminate data redundancy and maintain referential integrity. The standard is third normal form (3NF), where every non-key column depends on the key, the whole key, and nothing but the key. Normalization is the right starting point for SQL schemas, but strict normalization is not always the right choice for production applications.

Third normal form means: each table has a primary key; all columns depend on the entire primary key (applicable to composite keys); and no column depends on another non-key column. Normalization prevents update anomalies where changing a piece of data in one place requires changes in multiple places. For example, storing a customer's address in the orders table is denormalized because the address depends on the customer, not the order. If the customer moves, every order row must be updated. Normalization would store the address in a customers table and reference it by customer ID in the orders table.

However, strict normalization can lead to excessive joins that hurt read performance. The remedy is selective denormalization: duplicate data that is read frequently and updated rarely. A products table might include a category_name column even though it also exists in the categories table, because product pages always show the category name and categories change infrequently. The rule for denormalization is: only denormalize when you can measure a performance problem, and always document where duplicated data originates so future developers know to keep it in sync.

## Relationships: One-to-Many

One-to-many relationships are the most common relationship type. A user has many orders; a category has many products; a project has many tasks. In SQL, this is modeled with a foreign key in the child table referencing the parent table's primary key. The foreign key column (user_id in the orders table) establishes the relationship and enables joins.

In Firestore, a one-to-many relationship can be modeled in three ways. The first is a subcollection: orders as a subcollection under the user document. This is appropriate when orders are always accessed in the context of a user and the total number of orders per user is manageable (under a few thousand). The second is a top-level collection with a parent reference: an orders collection where each document has a user_id field. This is appropriate when orders need to be queried independently of users, such as an admin listing all orders across all users. The third is an array of references on the parent document, suitable only for small, bounded collections like "user's favorite products."

Choose the Firestore approach based on access patterns. If you always query orders by user, use a subcollection. If you query orders by user and by other criteria (date range, status) across all users, use a top-level collection with user_id. If you need both patterns, use a top-level collection and create the necessary indexes.

## Relationships: Many-to-Many

Many-to-many relationships connect entities where each can relate to many of the other. A student can be enrolled in many courses, and a course can have many students. An order can contain many products, and a product can appear in many orders.

In SQL, many-to-many relationships require a junction table. The junction table contains foreign keys referencing both related tables, plus any relationship-specific data (enrollment date, quantity, role). The junction table's primary key is typically a composite of both foreign keys, though a surrogate key (auto-increment ID) can be used if needed.

In Firestore, many-to-many relationships require careful design. The simplest approach is a top-level collection that acts as a junction: an enrollments collection with course_id and user_id fields. Query enrollments by course_id to get all students in a course. Query by user_id to get all courses for a user. Create composite indexes on both fields. For smaller, bounded many-to-many relationships, you can store an array of IDs on each document. For example, a product document might have a related_product_ids array containing IDs of related products. This works well when the array size is small (under a hundred) and updates are infrequent.

## Indexes

Indexes are the primary mechanism for query performance in both SQL and Firestore. An index is a data structure that maps column values to row locations, allowing the database to find matching rows without scanning the entire table or collection.

In SQL, create indexes on columns used in WHERE clauses, JOIN conditions, ORDER BY clauses, and grouping operations. Composite indexes (indexes on multiple columns) are useful for queries that filter on multiple columns. The order of columns in a composite index matters: put equality-filtered columns first, range-filtered columns second, and sort columns last. An index on (status, created_at) supports "WHERE status = 'active' ORDER BY created_at DESC" efficiently, while an index on (created_at, status) would not.

Avoid over-indexing. Every index slows down write operations because the index must be updated on every INSERT, UPDATE, and DELETE. An application that writes frequently and reads infrequently needs fewer indexes than an application that reads frequently and writes rarely. Monitor slow queries and add indexes as needed rather than creating indexes preemptively for every column.

In Firestore, single-field indexes are created automatically. Composite indexes must be created explicitly. Firestore requires composite indexes for queries that combine equality conditions on different fields or combine an equality condition with a range condition on a different field. Create composite indexes for every query pattern during development; Firestore will return an error at runtime if a query requires an index that does not exist.

## Query Optimization

Query optimization starts with understanding the query plan. In SQL, use EXPLAIN to see how the database executes a query: which indexes it uses, how many rows it scans, how it joins tables. A query that scans millions of rows to return ten results needs a better index or a different query structure.

The most impactful optimization is reducing the amount of data the database must process. Select only the columns you need instead of SELECT *. Filter as early as possible in the query. Use LIMIT to avoid returning unnecessary rows. Break complex queries into simpler steps where possible, though be aware that multiple round trips have their own cost.

In Firestore, query optimization focuses on minimizing document reads because Firestore pricing is based on reads, writes, and storage. Use collection group queries sparingly because they can scan many documents. Use document references instead of deeply nested subcollections. Set appropriate query limits and use cursors for pagination rather than offsets.

For both SQL and Firestore, avoid the N+1 query problem where a single query triggers a loop of additional queries. In SQL, this means using JOINs or eager loading instead of lazy loading related records one at a time. In Firestore, it means denormalizing data or using batch reads.

## Naming Conventions

Consistent naming conventions make database schemas self-documenting and reduce confusion across teams. The specific convention matters less than the fact that one exists and is followed consistently.

For SQL databases, use lowercase snake_case for table and column names. Table names should be plural nouns (users, orders, products). Column names should be descriptive without being verbose (created_at rather than date_of_creation). Primary key columns should be named id unless the table name helps disambiguate in joins (order_id in the order_items table). Foreign key columns should match the referenced table's primary key name, typically table_name_id (user_id, order_id). Junction tables should combine both table names (order_products, student_courses).

For Firestore, use lowercase with hyphens or camelCase for collection names. Document IDs should be meaningful where possible (using slugs or natural keys) rather than auto-generated IDs, but only if the ID is stable. Auto-generated IDs are safer for user-generated content where slugs might change or collide. Field names should follow the same convention used in the application code, typically camelCase.

## Scalability Rules

Scalability planning means designing for the data volume and access patterns you expect, with room for growth. Premature scaling adds complexity without benefit, but ignoring scalability entirely leads to painful migrations.

In SQL databases, the most common bottleneck is table size. Tables with millions of rows can still perform well with proper indexing, but tables with hundreds of millions of rows require partitioning or sharding. Plan for partitioning by a natural dimension like date (orders_2024_01, orders_2024_02) or by tenant ID in multi-tenant applications. Partitioning allows the database to prune entire partitions from queries.

In Firestore, scalability is largely automatic, but there are limits to be aware of. Firestore documents have a maximum size of 1 MB. Avoid storing large binary data (images, files) in documents; use Cloud Storage and store the URL. Firestore has a maximum write rate of 10,000 writes per second per database, which is sufficient for most applications but can be a constraint for high-traffic events like flash sales or live voting. Use counters or distributed counters for fields that are updated frequently.

Both SQL and Firestore benefit from connection pooling, query caching, and read replica strategies for read-heavy workloads. Connection pooling reduces the overhead of establishing database connections. Query caching (using Redis, Memcached, or Firestore's built-in persistence) reduces the number of repeated queries that reach the database. Read replicas allow read queries to be distributed across multiple database instances, keeping the primary instance free for write operations.

## Example Schema: SaaS Application (Project Management)

Consider a project management SaaS application with users, projects, tasks, comments, and notifications.

SQL schema:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES projects(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id),
    assignee_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(project_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(project_id, due_date);
```

Firestore equivalent structure:

```
/users/{userId}
  - email, name, createdAt, lastLogin

/projects/{projectId}
  - name, description, ownerId, status, createdAt, updatedAt
  /members/{userId}
    - role, joinedAt
  /tasks/{taskId}
    - title, description, status, priority, assigneeId, dueDate, createdAt, updatedAt
```

Key design decisions: tasks are a subcollection under projects because tasks are always queried in the context of a project. Project members are also a subcollection. Composite indexes are needed on projects/tasks for queries filtering by both status and assignee or status and due date. The users collection is top-level because users exist independently of projects.

## Example Schema: E-commerce Platform

SQL schema:

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);

CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE TABLE order_items (
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
```

Firestore equivalent structure:

```
/customers/{customerId}
  - email, name, createdAt

/products/{productId}
  - name, description, price, categoryId, stockQuantity, avgRating, reviewCount
  /reviews/{reviewId}
    - customerId, customerName, rating, text, createdAt

/orders/{orderId}
  - customerId, status, total, shippingAddress, createdAt
  /items/{itemId}
    - productId, productName, quantity, unitPrice
```

Key design decisions: avgRating and reviewCount are denormalized onto the product document to avoid computing them on every product page. Order items are a subcollection under orders because items are always queried in the context of their parent order. Reviews are a subcollection under products but also need a collection group query if an admin needs to see all reviews across all products. Product stock tracking requires careful handling: when an order is placed, the stock quantity must be decremented atomically using Firestore's increment operation or, in SQL, using an UPDATE within a transaction.

## Do's and Don'ts

Do design your schema around query patterns, not domain models. Do denormalize data when it improves read performance and consistency can be maintained. Do create composite indexes for every query pattern. Do use subcollections in Firestore for data that is always accessed through a parent. Do use junction tables in SQL for many-to-many relationships. Do use transactions for operations that require atomicity across multiple documents or records. Do document the reasoning behind denormalization decisions.

Don't nest Firestore subcollections more than two levels deep. Don't use Firestore arrays for data that needs individual element updates. Don't SELECT * in production SQL queries. Don't create indexes on every column—index what you query. Don't store large binary data in Firestore documents or SQL BLOB columns. Don't ignore query plans and EXPLAIN output. Don't assume a normalized schema is always the best schema. Don't forget to plan for indexing strategy during schema design, not after performance problems appear.

Database planning is not a one-time activity. As the application evolves, new features introduce new query patterns, data volumes grow, and access patterns change. Revisit the schema design periodically and refactor when the current design no longer serves the application's needs. A database that was well-designed for a startup's first year may need significant changes in year three. Plan for that evolution by keeping modules loosely coupled and data access encapsulated behind clear interfaces.
