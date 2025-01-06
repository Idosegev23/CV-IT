import { motion } from "framer-motion";
import Image from "next/image";

export const FileAnimation = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1.2, 1] }}
    transition={{ duration: 0.5 }}
    className="absolute"
  >
    <Image src="/design/point.svg" alt="file" width={40} height={40} />
  </motion.div>
);

export const LoadingAnimation = () => (
  <div className="relative">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="h-16 w-16 rounded-full border-4 border-t-primary"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="h-8 w-8 rounded-full bg-primary/20" />
    </motion.div>
  </div>
); 