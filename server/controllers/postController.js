/**
 * Post Controller (Public APIs)
 * Thầy Giáo KDOL - "1 đơn hàng - 1 nụ cười"
 */

const Post = require('../models/Post');
const { sanitizeContent, escapeRegex } = require('../utils/sanitize');

// @desc    Lấy danh sách bài viết đã xuất bản (Published)
// @route   GET /api/posts?page=1&limit=6&category=&search=
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const { category, search, q, page, limit } = req.query;

    // Validate và chuẩn hóa tham số phân trang (Giới hạn tối đa 50 bài/trang)
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const rawLimit = parseInt(limit, 10) || 6;
    const limitNum = Math.min(Math.max(1, rawLimit), 50);
    const skip = (pageNum - 1) * limitNum;

    // Chỉ lấy bài viết ở trạng thái 'published'
    const query = { status: 'published' };

    // Lọc theo chuyên mục (Hỗ trợ cả tên chuyên mục và slug chuyên mục, an toàn Regex)
    if (category && typeof category === 'string' && category.trim() !== '' && category !== 'all') {
      const cleanCat = escapeRegex(category.trim());
      query.$or = [
        { category: new RegExp(`^${cleanCat}$`, 'i') },
        { tags: new RegExp(`^${cleanCat}$`, 'i') }
      ];
    }

    // Tìm kiếm theo từ khóa trong tiêu đề (title) và trích dẫn (excerpt) (An toàn ReDoS & Injection)
    const rawKeyword = typeof search === 'string' ? search : (typeof q === 'string' ? q : '');
    const keyword = rawKeyword.trim();
    if (keyword) {
      const safeKeyword = escapeRegex(keyword);
      const searchRegex = new RegExp(safeKeyword, 'i');
      const searchConditions = [
        { title: searchRegex },
        { excerpt: searchRegex }
      ];

      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchConditions }
        ];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Đếm tổng số lượng thỏa mãn điều kiện
    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Lấy danh sách bài viết (loại bỏ trường content nặng khi xem danh sách)
    const posts = await Post.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-content -__v')
      .lean();

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy danh sách bài viết nổi bật (Featured Posts)
// @route   GET /api/posts/featured
// @access  Public
const getFeaturedPosts = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 4), 10);

    const posts = await Post.find({
      status: 'published',
      featured: true
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-content -__v')
      .lean();

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một bài viết theo Slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Tham số slug không hợp lệ'
      });
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Tìm bài viết theo slug chính
    const post = await Post.findOne({
      slug: cleanSlug,
      status: 'published'
    })
      .select('-__v')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy bài viết với đường dẫn: ${cleanSlug}`
      });
    }

    // Lấy 3 bài viết liên quan trong cùng chuyên mục
    const relatedPosts = await Post.find({
      category: post.category,
      _id: { $ne: post._id },
      status: 'published'
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt thumbnail thumbnailIcon category publishedAt readTime')
      .lean();

    // Nếu chưa đủ 3 bài cùng chuyên mục, lấy bổ sung các bài mới nhất khác
    let finalRelated = relatedPosts;
    if (finalRelated.length < 3) {
      const existingIds = [post._id, ...finalRelated.map(r => r._id)];
      const backfill = await Post.find({
        _id: { $nin: existingIds },
        status: 'published'
      })
        .sort({ publishedAt: -1 })
        .limit(3 - finalRelated.length)
        .select('title slug excerpt thumbnail thumbnailIcon category publishedAt readTime')
        .lean();

      finalRelated = [...finalRelated, ...backfill];
    }

    // Làm sạch nội dung an toàn trước khi trả về
    const sanitizedPost = {
      ...post,
      content: sanitizeContent(post.content),
      relatedPosts: finalRelated
    };

    res.status(200).json({
      success: true,
      data: sanitizedPost
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN APIS (requireAdmin)
// ==========================================

// @desc    Lấy danh sách tất cả bài viết cho Admin (bao gồm bản nháp, lọc, tìm kiếm, phân trang)
// @route   GET /api/admin/posts
// @access  Private (requireAdmin)
const getAdminPosts = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      const cleanCat = escapeRegex(category.trim());
      query.category = new RegExp(`^${cleanCat}$`, 'i');
    }
    if (search && search.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { slug: searchRegex }
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 bài viết theo ID cho Admin
// @route   GET /api/admin/posts/:id
// @access  Private (requireAdmin)
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload ảnh bài viết
// @route   POST /api/admin/upload/post
// @access  Private (requireAdmin)
const uploadPostImage = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload ảnh bài viết thành công!',
    url: req.uploadedFileUrl
  });
};

// @desc    Tạo Bài viết mới
// @route   POST /api/admin/posts
// @access  Private (requireAdmin + CSRF)
const createPost = async (req, res, next) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      tags,
      thumbnail,
      thumbnailIcon,
      featuredImage,
      featuredImageCaption,
      readTime,
      status = 'published',
      featured = false
    } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Tiêu đề bài viết là bắt buộc.' });
    }
    if (!excerpt || !excerpt.trim()) {
      return res.status(400).json({ success: false, message: 'Tóm tắt bài viết là bắt buộc.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Chuyên mục bài viết là bắt buộc.' });
    }
    if (!content) {
      return res.status(400).json({ success: false, message: 'Nội dung bài viết là bắt buộc.' });
    }

    let cleanSlug = (slug || title).toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const existingSlug = await Post.findOne({ slug: cleanSlug });
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const post = await Post.create({
      title: title.trim(),
      slug: cleanSlug,
      excerpt: excerpt.trim(),
      content: sanitizeContent(content),
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()).filter(Boolean) : []),
      thumbnail: thumbnail || 'assets/images/article-default.svg',
      thumbnailIcon: thumbnailIcon || 'book',
      featuredImage: featuredImage || thumbnail || 'assets/images/article-default.svg',
      featuredImageCaption: featuredImageCaption || '',
      readTime: readTime || '5 phút đọc',
      status,
      featured: Boolean(featured),
      publishedAt: status === 'published' ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công!',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật Bài viết
// @route   PUT /api/admin/posts/:id
// @access  Private (requireAdmin + CSRF)
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết.' });
    }

    const updates = req.body || {};
    if (updates.title) post.title = updates.title.trim();
    if (updates.slug) {
      const cleanSlug = updates.slug.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const slugConflict = await Post.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (slugConflict) {
        return res.status(400).json({ success: false, message: 'Đường dẫn (slug) này đã được sử dụng bởi bài viết khác.' });
      }
      post.slug = cleanSlug;
    }
    if (updates.excerpt) post.excerpt = updates.excerpt.trim();
    if (updates.content) post.content = sanitizeContent(updates.content);
    if (updates.category) post.category = updates.category.trim();
    if (updates.tags !== undefined) {
      post.tags = Array.isArray(updates.tags)
        ? updates.tags
        : (updates.tags ? String(updates.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
    }
    if (updates.thumbnail) post.thumbnail = updates.thumbnail;
    if (updates.thumbnailIcon) post.thumbnailIcon = updates.thumbnailIcon;
    if (updates.featuredImage) post.featuredImage = updates.featuredImage;
    if (updates.featuredImageCaption !== undefined) post.featuredImageCaption = updates.featuredImageCaption;
    if (updates.readTime) post.readTime = updates.readTime;
    if (updates.status) {
      if (updates.status === 'published' && post.status !== 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
      post.status = updates.status;
    }
    if (updates.featured !== undefined) post.featured = Boolean(updates.featured);

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật bài viết thành công!',
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa Bài viết
// @route   DELETE /api/admin/posts/:id
// @access  Private (requireAdmin + CSRF)
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết để xóa.' });
    }
    await Post.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: 'Đã xóa bài viết thành công.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getFeaturedPosts,
  getPostBySlug,
  getAdminPosts,
  getPostById,
  uploadPostImage,
  createPost,
  updatePost,
  deletePost
};
