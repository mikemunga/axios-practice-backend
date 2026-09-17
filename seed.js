import { response } from "express";
import pool from "./db.js";
import axios from 'axios';

async function bulkSeedDatabase () {
    try{
        const response = await axios.get('https://fakestoreapi.com/products')
        const products = response.data;

        if(!products || products.length === 0){
            console.log('no products found to seed.');
            return;
        }
        const columnsCount = 8;
        const valuePlaceholders = [];
        const flatValuesArray = [];

        products.forEach ((item, index)=>{
            const offset = index*columnsCount;
            valuePlaceholders.push(
                `($${offset +1}, $${offset + 2}, $${offset + 3},$${offset + 4}, $${offset + 5}, $${offset + 6},$${offset + 7}, $${offset + 8})`
            );
            flatValuesArray.push(
                item.id,
                item.title,
                item.price,
                item.description,
                item.category,
                item.image,
                item.rating?.rate || 0,
                item.rating?.count || 0
            );
        });
        const queryText =`
        INSERT INTO products (id, title, price, description, category, image, rating_rate, rating_count)
        VALUES ${valuePlaceholders.join(',')}
        ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        image = EXCLUDED.image,
        rating_rate = EXCLUDED.rating_rate,
        rating_count = EXCLUDED.rating_count
        `;
        await pool.query(queryText, flatValuesArray);
        console.log('Database successfully populated')
    }catch(error){
        console.log(error.message)
    }
}

bulkSeedDatabase()



async function appendProducts(){
    try{
        const response = await axios.get('https://dummyjson.com/products',{
            params:{
                limit:70,
                skip:30
            }
        });
        const newProducts = response.data.products;
        if(!newProducts || !Array.isArray(newProducts) || newProducts.length===0){
            console.log('No fresh data returned from the server.')
            return;
        };
        const valuesArray =[];
        const valuePlaceholders =[];
        let indexProvider = 1;

        for (const item of newProducts){
            const title = item.title;
            const price = parseInt(item.price || 0.0);
            const description = item.description ||'Premium product selection';
            const category = item.category || 'general';
            const image = item.thumbnail ||'';
            const ratingRate= parseInt(item.rating || 0.0);
            const ratingCount =Math.floor(Math.random()* 300)+15;

            const productTags = item.tags || [];
            const productImages = item.images || [];

            valuesArray.push(
               item.id, title,price,description,category,image,ratingRate,ratingCount,productTags,productImages
            );
            const rowPlaceholders =[];
            for (let i=0; i<10 ; i++){
                rowPlaceholders.push(`$${indexProvider++}`)
            };
            valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        }
        if(valuePlaceholders.length === 0) return;
        const bulkQUery = `
        INSERT INTO products (id,title, price, description, category, image, rating_rate, rating_count, tags, images)
        VALUES ${valuePlaceholders.join(', ')};
        `
        const dbResult = await pool.query(bulkQUery, valuesArray);
        console.log('Succesfully added')

    }catch (error){
        console.log(error)
    }finally{
        await pool.end;
    }
};

appendProducts()