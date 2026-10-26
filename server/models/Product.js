import mongoose from 'mongoose';
const imageSchema=new mongoose.Schema({url:{type:String,required:true},publicId:{type:String,required:true}},{_id:false});
const productSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},description:{type:String,default:''},category:{type:String,required:true,index:true},price:{type:Number,required:true,min:0},currency:{type:String,default:'RWF'},unit:{type:String,default:'piece'},stock:{type:Number,default:0,min:0},seller:{name:{type:String,required:true},location:{type:String,required:true},phone:String},images:{type:[imageSchema],default:[]},rating:{type:Number,default:0,min:0,max:5},reviewCount:{type:Number,default:0},isActive:{type:Boolean,default:true,index:true}},{timestamps:true});
productSchema.index({name:'text',description:'text','seller.name':'text'});
export default mongoose.model('Product',productSchema);
