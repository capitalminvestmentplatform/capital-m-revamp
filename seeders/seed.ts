import MalcoAsset from "../models/malco/MalcoAsset";
// import { categories, malcoAssets, subCategories } from "../data/pandaConnect";
import { connectToDatabase } from "../lib/db";
import Category from "../models/Category";
import MalcoSubcategory from "../models/malco/MalcoSubCategory";
import MalcoCategory from "../models/malco/MalcoCategory";
import {
  categories,
  malcoCategories,
  malcoSubCategories,
  users,
} from "../data/data";
import User from "../models/User";

async function seed() {
  try {
    await connectToDatabase();

    await MalcoSubcategory.deleteMany({});
    await MalcoCategory.deleteMany({});

    // Insert categories
    const createdCategories = await MalcoCategory.insertMany(malcoCategories);

    // // Insert subcategories with category name as reference
    const createdSubcategories = await MalcoSubcategory.insertMany(
      malcoSubCategories.map((subcat) => {
        const category = createdCategories.find(
          (cat) => cat.name.toLowerCase() === subcat.category.toLowerCase()
        );
        return {
          name: subcat.name,
          category: category?._id, // your model uses name as ref
        };
      })
    );

    // // Insert malcoAssets with category and subCategory names as references
    // const assetsToInsert = malcoAssets.map((asset) => {
    //   const category = createdCategories.find(
    //     (cat) => cat.name.toLowerCase() === asset.category.toLowerCase()
    //   );
    //   const subCategory = createdSubcategories.find(
    //     (sub) => sub.name.toLowerCase() === asset.subCategory.toLowerCase()
    //   );

    //   return {
    //     ...asset,
    //     category: category?.name,
    //     subCategory: subCategory?.name,
    //   };
    // });

    // await MalcoAsset.insertMany(assetsToInsert);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
