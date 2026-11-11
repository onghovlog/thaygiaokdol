/**
 * Post Mongoose Schema & Model
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết là bắt buộc'],
      trim: true,
      maxlength: [250, 'Tiêu đề không vượt quá 250 ký tự']
    },
    slug: {
      type: String,
      required: [true, 'Slug bài viết là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: [true, 'Đoạn trích tóm tắt là bắt buộc'],
      trim: true,
      maxlength: [500, 'Tóm tắt không vượt quá 500 ký tự']
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Nội dung bài viết là bắt buộc']
      // Hỗ trợ cả mảng structured contentBlocks hoặc chuỗi HTML an toàn
    },
    thumbnail: {
      type: String,
      trim: true,
      default: 'assets/images/article-default.svg'
    },
    thumbnailIcon: {
      type: String,
      trim: true,
      default: 'book'
    },
    featuredImage: {
      type: String,
      trim: true,
      default: 'assets/images/article-default.svg'
    },
    featuredImageCaption: {
      type: String,
      trim: true,
      default: ''
    },
    readTime: {
      type: String,
      trim: true,
      default: '5 phút đọc'
    },
    category: {
      type: String,
      required: [true, 'Chuyên mục bài viết là bắt buộc'],
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: 'Trạng thái bài viết phải là draft, published hoặc archived'
      },
      default: 'published'
    },
    featured: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes phục vụ tìm kiếm bài viết, sắp xếp và lọc theo danh mục
postSchema.index({ publishedAt: -1 });
postSchema.index({ status: 1 });
postSchema.index({ category: 1 });
postSchema.index({ featured: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
