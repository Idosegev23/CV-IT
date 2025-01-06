'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import Image from 'next/image';
import { Github, Linkedin, Mail } from 'lucide-react';

const content = {
  he: {
    title: "הצוות שלנו",
    description: "הכירו את האנשים שעומדים מאחורי המוצר",
    team: [
      {
        name: "עידו שגב",
        role: "Full Stack Developer",
        image: "/team/ido.jpg",
        bio: "מפתח Full Stack עם התמחות ב-React ו-Node.js. מוביל טכני עם ניסיון בפיתוח מוצרים מורכבים.",
        social: {
          github: "https://github.com/idosegev",
          linkedin: "https://linkedin.com/in/idosegev",
          email: "ido@cvit.com"
        }
      },
      {
        name: "לי פן",
        role: "UX/UI Designer",
        image: "/team/lee.jpg",
        bio: "מעצבת UX/UI עם ניסיון עשיר בעיצוב ממשקים. מתמחה בחווית משתמש ועיצוב אינטראקטיבי.",
        social: {
          github: "https://github.com/leepen",
          linkedin: "https://linkedin.com/in/leepen",
          email: "lee@cvit.com"
        }
      },
      {
        name: "אבי מוטולה",
        role: "Backend Developer",
        image: "/team/avi.jpg",
        bio: "מפתח Backend עם התמחות בארכיטקטורת מערכות. מומחה באבטחת מידע ופרפורמנס.",
        social: {
          github: "https://github.com/avimotola",
          linkedin: "https://linkedin.com/in/avimotola",
          email: "avi@cvit.com"
        }
      }
    ]
  },
  en: {
    title: "Our Team",
    description: "Meet the people behind the product",
    team: [
      {
        name: "Ido Segev",
        role: "Full Stack Developer",
        image: "/team/ido.jpg",
        bio: "Full Stack developer specializing in React and Node.js. Technical lead with experience in complex product development.",
        social: {
          github: "https://github.com/idosegev",
          linkedin: "https://linkedin.com/in/idosegev",
          email: "ido@cvit.com"
        }
      },
      {
        name: "Lee Pen",
        role: "UX/UI Designer",
        image: "/team/lee.jpg",
        bio: "UX/UI designer with rich experience in interface design. Specializes in user experience and interactive design.",
        social: {
          github: "https://github.com/leepen",
          linkedin: "https://linkedin.com/in/leepen",
          email: "lee@cvit.com"
        }
      },
      {
        name: "Avi Motola",
        role: "Backend Developer",
        image: "/team/avi.jpg",
        bio: "Backend developer specializing in system architecture. Expert in security and performance.",
        social: {
          github: "https://github.com/avimotola",
          linkedin: "https://linkedin.com/in/avimotola",
          email: "avi@cvit.com"
        }
      }
    ]
  }
};

export default function TeamSection() {
  const { language } = useLanguage();
  const currentContent = content[language as keyof typeof content];
  const isRTL = language === 'he';

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text mb-6">
            {currentContent.title}
          </h2>
          <p className="text-xl text-white/60">
            {currentContent.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentContent.team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/5 rounded-2xl overflow-hidden"
            >
              <div className="relative h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-emerald-400 mb-4">{member.role}</p>
                <p className="text-white/60 mb-6">{member.bio}</p>
                <div className="flex gap-4">
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={`mailto:${member.social.email}`} className="text-white/60 hover:text-white">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 