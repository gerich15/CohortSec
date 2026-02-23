import { motion } from "framer-motion";

interface Member {
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export function TeamMember({ member, index }: { member: Member; index: number }) {
  return (
    <motion.div
      className="team-member-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <div className="team-member-avatar">
        <div className="avatar-placeholder">
          {member.name.charAt(0)}
        </div>
      </div>
      <h3 className="team-member-name">{member.name}</h3>
      <p className="team-member-role">{member.role}</p>
      <p className="team-member-bio">{member.bio}</p>
    </motion.div>
  );
}
