import IImageFile from "@/models/common/IImageFile";

export interface RegisterModel{
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    image?: IImageFile
}