import mongoose from "mongoose";
 const StudentSchema = new mongoose.Schema({
    name: {type: String,required: true},
    email: {type: String,required: true,unique: true},
    password: {type: String,required: true},
    contactNumber: {type: String,required: true},
    

 })

 const Student = mongoose.models.Student || mongoose.model('Student',StudentSchema)
 
export default Student;
