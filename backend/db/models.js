const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  profile_image: { type: String, default: null },
  role: { type: String, default: "ADMIN" },
  created_at: { type: Date, default: Date.now },
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon_name: { type: String, required: true },
});

const UMKMSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String },
  category_id: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  owner_name: { type: String, required: true },
  description: { type: String, default: "" },
  address: { type: String, required: true },
  dusun: { type: String, required: true },
  operational_hours: { type: String, default: null },
  whatsapp_number: { type: String, default: "" },
  maps_url: { type: String, default: null },
  instagram_url: { type: String, default: null },
  image_url: { type: String, required: true },
  landing_text: { type: String, default: "" },
  gmaps_embed: { type: String, default: null },
  is_verified: { type: Boolean, default: true },
  certifications: { type: [String], default: [] },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  rating: { type: Number, default: 0.00 },
  review_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  umkm_id: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  unit: { type: String, default: "pcs" },
  description: { type: String, default: "" },
  image_url: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  umkm_id: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, default: 5 },
  comment: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const SiteSettingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const UMKM = mongoose.models.UMKM || mongoose.model("UMKM", UMKMSchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
const SiteSetting = mongoose.models.SiteSetting || mongoose.model("SiteSetting", SiteSettingSchema);

module.exports = {
  User,
  Category,
  UMKM,
  Product,
  Review,
  SiteSetting,
};
