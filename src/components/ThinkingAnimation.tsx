import { motion } from 'framer-motion'

interface ThinkingAnimationProps {
  visible: boolean
}

const dots = [0, 1, 2]

export function ThinkingAnimation({ visible }: ThinkingAnimationProps) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2 w-2 rounded-full bg-primary"
        />
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-primary">Thinking</span>
        <div className="flex gap-1">
          {dots.map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="h-1 w-1 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="ml-auto"
      >
        <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary" />
      </motion.div>
    </motion.div>
  )
}
