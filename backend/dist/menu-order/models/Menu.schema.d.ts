import { Document } from 'mongoose';
import { Types } from 'mongoose';
export type MenuDocument = Menu & Document;
export declare class Menu {
    title: string;
    items: Types.ObjectId[];
}
export declare const MenuSchema: import("mongoose").Schema<Menu, import("mongoose").Model<Menu, any, any, any, Document<unknown, any, Menu, any, {}> & Menu & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Menu, Document<unknown, {}, import("mongoose").FlatRecord<Menu>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Menu> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
