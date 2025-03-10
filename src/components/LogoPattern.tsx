import React from 'react';
import { motion } from "framer-motion";

const LogoPattern = () => {
  const logos = [
    { top: '5%', left: '10%', size: '150px', rotate: -15 },
    { top: '15%', right: '15%', size: '200px', rotate: 20 },
    { top: '45%', left: '20%', size: '180px', rotate: -10 },
    { top: '60%', right: '5%', size: '250px', rotate: 15 },
    { top: '75%', left: '15%', size: '160px', rotate: 25 },
    { top: '85%', right: '25%', size: '190px', rotate: -20 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {logos.map((logo, index) => (
        <motion.div
          key={index}
          className="absolute opacity-5"
          style={{
            top: logo.top,
            left: logo.left,
            right: logo.right,
            width: logo.size,
            height: logo.size,
          }}
          initial={{ opacity: 0, rotate: logo.rotate }}
          animate={{ 
            opacity: 0.05,
            rotate: logo.rotate,
            y: [0, -20, 0]
          }}
          transition={{
            opacity: { duration: 1 },
            y: {
              duration: 8,
              repeat: Infinity,
              delay: index * 0.5,
              ease: "easeInOut"
            }
          }}
        >
          <svg viewBox="0 0 1080 1080" className="w-full h-full">
            {/* Semi-colon part only */}
            <path 
              fill="currentColor"
              d="M868.73,489.4h-.16c-.21,0-.37.02-.47.03-.03.22-.05.53-.05.94,0,.37.04.59.06.66.01.03.03.06.05.08.39-.41.56-.67.62-.78,0-.41-.03-.72-.05-.93ZM867.85,581.15c-.56-1.36-1-1.71-1-1.71-.06-.04-.1-.06-.11-.07h-.18c-.44,0-.52,0-.98.44-.08.07-.13.13-.16.17-.01.06-.03.18-.03.35,0,.57.05.94.09,1.15.32.24.68.38,1.5.38h1.14c-.09-.27-.18-.51-.27-.71Z M896.67,569.17c-2.71-6.51-6.73-11.65-11.95-15.31-5.41-3.78-11.53-5.7-18.16-5.7-8.55,0-16.35,3.16-22.58,9.12-6.4,6.14-9.79,14.11-9.79,23.05,0,11.96,5.14,19.44,9.72,23.73-5.87,4.71-9.19,11.45-9.19,18.86,0,5.83,2.05,11.23,5.93,15.62,4.3,4.87,10.34,7.55,17,7.55,7.33,0,14.69-3.19,21.89-9.48,5.91-5.17,10.88-12.04,14.76-20.41,3.91-8.46,5.9-17.6,5.9-27.19,0-7.53-1.19-14.2-3.53-19.84ZM866.98,581.86c-.82,0-1.18-.14-1.5-.38-.04-.21-.09-.58-.09-1.15,0-.17.02-.29.03-.35.03-.04.08-.1.16-.17.46-.44.54-.44.98-.44h.18s.05.03.11.07c0,0,.44.35,1,1.71.09.2.18.44.27.71h-1.14Z M890.41,466.83c-6.01-5.65-13.56-8.63-21.84-8.63s-15.94,2.92-21.95,8.44c-4.46,4.1-9.78,11.54-9.78,23.73,0,5.97,1.45,11.48,4.3,16.37h.01c2.76,4.74,6.53,8.58,11.2,11.42,4.91,2.98,10.37,4.49,16.22,4.49s14.28-1.73,22.16-10c6.06-6.34,9.26-14.04,9.26-22.28,0-12-5.21-19.43-9.58-23.54ZM868.16,491.11s-.04-.05-.05-.08c-.02-.07-.06-.29-.06-.66,0-.41.02-.72.05-.94.1-.01.26-.03.47-.03h.16c.02.21.05.52.05.93-.06.11-.23.37-.62.78Z"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default LogoPattern;