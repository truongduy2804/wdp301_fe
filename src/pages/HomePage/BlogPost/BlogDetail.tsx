import { Clock, Star, ArrowLeft, Share2, Clipboard, Facebook, Twitter, Linkedin } from "lucide-react";
import { useGetBlogQuery } from "@redux/api/blog/blogApi";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetBlogQuery(id || '');
  const [isCopied, setIsCopied] = useState(false);

  const blog = data?.data;

  if (isLoading) return <div className="text-center py-14">Đang tải...</div>;
  if (isError || !blog) return <div className="text-center py-14 text-red-500">Bài viết không tồn tại</div>;

  const shareUrl = `${window.location.origin}/blog/${blog.id}`;
  const shareTitle = encodeURIComponent(blog.title);
  const shareDescription = encodeURIComponent(blog.shortdesc || blog.content.substring(0, 150) + '...');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${shareTitle}&summary=${shareDescription}`,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="px-5 md:px-8 pt-5">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </button>
      </section>

      {/* Title Section */}
      <section className="relative py-8 text-center">
        <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
          <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            {blog.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {blog.shortdesc || blog.content.substring(0, 150) + '...'}
          </p>
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(blog.createdAt).toLocaleDateString()}
            </div>
            <div>{blog.authorName}</div>
            {blog.status === 'Featured' && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                NỔI BẬT
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image */}
      {blog.imageUrl && (
        <section className="px-5 md:px-8">
          <div className="mx-auto w-full max-w-4xl">
            <img
              src={blog.imageUrl}
              alt={blog.title}
              className="w-full h-auto rounded-2xl shadow-lg mb-8"
            />
          </div>
        </section>
      )}

      {/* Content */}
      <section className="px-5 md:px-8 pb-10">
        <div className="mx-auto w-full max-w-4xl prose prose-headings:font-bold prose-a:text-teal-600 prose-img:rounded-xl">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </section>

      {/* Share Section */}
      <section className="px-5 md:px-8 pb-10">
        <div className="mx-auto w-full max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chia sẻ bài viết</h3>
          <div className="flex items-center gap-4">
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="w-5 h-5" />
              Facebook
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              <Twitter className="w-5 h-5" />
              Twitter
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
              LinkedIn
            </a>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Clipboard className="w-5 h-5" />
              {isCopied ? 'Đã sao chép!' : 'Sao chép liên kết'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogDetail;