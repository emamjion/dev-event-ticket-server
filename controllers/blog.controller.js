import { v2 as cloudinary } from "cloudinary";
import BlogModel from "../models/blog.model.js";

// Blog create function
const createBlog = async (req, res) => {
  try {
    const { title, text, metaTitle, metaDescription, category, author } =
      req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // if (req.file) {
    //   const result = await cloudinary.uploader.upload(req.file.path);
    //   featureImage = result.secure_url;
    //   fs.unlinkSync(req.file.path);
    // }

    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "event-images",
    });

    const blog = new BlogModel({
      title,
      text,
      metaTitle,
      metaDescription,
      category,
      image: result.secure_url,
      author,
    });

    await blog.save();
    res
      .status(201)
      .json({ success: true, message: "Blog created successfully", blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get all blogs - public
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      total: blogs.length,
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// get single blog by id
const getBlogById = async (req, res) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    res.status(200).json({
      success: true,
      message: `${blog.title} fetched successfully`,
      blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// update blog
const updateBlog = async (req, res) => {
  try {
    const { title, text, metaTitle, metaDescription, category, author } =
      req.body;
    let blog = await BlogModel.findById(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    // if (req.file) {
    //   const result = await cloudinary.uploader.upload(req.file.path);
    //   blog.featureImage = result.secure_url;
    //   fs.unlinkSync(req.file.path);
    // }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "event-images",
    });

    blog.title = title || blog.title;
    blog.text = text || blog.text;
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.category = category || blog.category;
    blog.image = result.secure_url || blog.image;
    blog.author = author || blog.author;

    await blog.save();
    res.status(200).json({
      success: true,
      message: `${blog.title} updated successfully`,
      blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// delete blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await BlogModel.findByIdAndDelete(req.params.id);
    if (!blog)
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });

    res
      .status(200)
      .json({ success: true, message: "Blog deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog };
