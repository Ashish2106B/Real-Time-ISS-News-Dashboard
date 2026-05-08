import { memo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import type { SpaceArticle } from '../../services/newsService';

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface NewsCardProps {
  article: SpaceArticle;
  index: number;
}

export const NewsCard = memo(({ article, index }: NewsCardProps) => (
  <motion.a
    href={article.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.04 }}
    whileHover={{ y: -3 }}
    className="group flex flex-col glass-card overflow-hidden hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
  >
    {/* Image */}
    {article.image_url ? (
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 backdrop-blur-sm">
          {article.news_site}
        </span>
      </div>
    ) : (
      <div className="h-10 flex items-center px-4 bg-[var(--card-bg)] flex-shrink-0 border-b border-[var(--border-color)]">
        <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-500">
          {article.news_site}
        </span>
      </div>
    )}

    {/* Content */}
    <div className="flex flex-col flex-1 p-4 space-y-2">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-purple-500 transition-colors">
        {article.title}
      </h3>
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 flex-1">{article.summary}</p>
      <div className="flex items-center justify-between pt-1">
        <span className="flex items-center text-[11px] text-[var(--text-muted)]">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo(article.published_at)}
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </motion.a>
));
