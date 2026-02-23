import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface NewsItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image?: string;
}

export function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/news/${item.slug}`}>
        <div className="news-card">
          {item.image && (
            <div className="news-card-image">
              <div className="news-card-image-placeholder" />
            </div>
          )}
          <span className="news-card-category">{item.category}</span>
          <h3 className="news-card-title">{item.title}</h3>
          <p className="news-card-excerpt">{item.excerpt}</p>
          <time className="news-card-date">{item.date}</time>
        </div>
      </Link>
    </motion.article>
  );
}
