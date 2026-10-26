import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();
const app=express();
const port=process.env.PORT||5000;
app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));
app.use(express.json());

cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
const storage=new CloudinaryStorage({cloudinary,params:{folder:'toolbay/products',allowed_formats:['jpg','jpeg','png','webp'],transformation:[{width:1400,height:1200,crop:'limit',quality:'auto'}]}});
const upload=multer({storage,limits:{fileSize:8*1024*1024}});

app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'toolbay-api'}));
app.get('/api/products',async(req,res)=>{
 try{const {q,category,sort='newest',page='1',limit='24'}=req.query;const filter={isActive:true};if(category&&category!=='All')filter.category=category;if(q)filter.$text={$search:q};const skip=(Math.max(1,Number(page))-1)*Math.min(100,Number(limit));const query=Product.find(filter);if(q)query.select({score:{$meta:'textScore'}}).sort({score:{$meta:'textScore'}});else if(sort==='price-asc')query.sort({price:1});else if(sort==='price-desc')query.sort({price:-1});else if(sort==='rating')query.sort({rating:-1});else query.sort({createdAt:-1});const [items,total]=await Promise.all([query.skip(skip).limit(Math.min(100,Number(limit))).lean(),Product.countDocuments(filter)]);res.json({items,total,page:Number(page),pages:Math.ceil(total/Math.min(100,Number(limit)))});}catch(e){res.status(500).json({error:'Could not load products'});}
});
app.get('/api/products/:id',async(req,res)=>{try{const product=await Product.findById(req.params.id).lean();if(!product||!product.isActive)return res.status(404).json({error:'Product not found'});res.json(product);}catch{res.status(400).json({error:'Invalid product ID'});}});
app.post('/api/products',upload.array('images',8),async(req,res)=>{try{const images=(req.files||[]).map(f=>({url:f.path,publicId:f.filename}));const product=await Product.create({...req.body,price:Number(req.body.price),stock:Number(req.body.stock||0),images});res.status(201).json(product);}catch(e){res.status(400).json({error:e.message||'Could not create product'});}});
app.delete('/api/products/:id',async(req,res)=>{try{const product=await Product.findById(req.params.id);if(!product)return res.status(404).json({error:'Product not found'});await Promise.all(product.images.map(i=>cloudinary.uploader.destroy(i.publicId).catch(()=>null)));await product.deleteOne();res.json({ok:true});}catch{res.status(400).json({error:'Could not delete product'});}});

mongoose.connect(process.env.MONGODB_URI).then(()=>{console.log('MongoDB connected');app.listen(port,()=>console.log(`Toolbay API listening on ${port}`));}).catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1);});
