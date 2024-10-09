const { logger } = require("../util/logger");
const {
  queryRecipes,
  insertRecipe,
  updateRecipe,
  deleteRecipe
} = require("../repository/recipe-dao");
const { scanCommentsByRecipeUuid, deleteComment } = require("../repository/comment-dao.js")
const Recipe = require("../model/recipe");

const response = { statusCode: null, data: null };

async function getRecipes(queryKey = null, queryVal = null) {
  try {
    const recipes = await queryRecipes(queryKey, queryVal);

    response.statusCode = recipes.$metadata.httpStatusCode;
    response.data = recipes.Items;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function createRecipe(recipeData, authorId) {
  try {
    validateId(authorId, "authorUuid");

    const newRecipe = new Recipe(recipeData, authorId);

    dataValidation(newRecipe);

    const recipe = await insertRecipe(newRecipe);
    response.statusCode = recipe.$metadata.httpStatusCode;
    response.data = recipe;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function editRecipe(recipeData, authorId) {
  try {
    validateId(authorId, "authorUuid");

    if (authorId != recipeData.authorUuid) {
      throw new Error("Only the recipe author is allowed to edit this recipe");
    }

    dataValidation(recipeData);

    const recipe = await updateRecipe(recipeData);
    response.statusCode = recipe.$metadata.httpStatusCode;
    response.data = recipe.Attributes;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

async function removeRecipe(recipeId, authorId) {
  try {
    validateId(recipeId, "uuid");

    const commentList = await scanCommentsByRecipeUuid(recipeId);
    commentList.forEach(async (comment) => {
      await deleteComment(comment.uuid);
    })

    const recipe = await deleteRecipe(recipeId, authorId);
    response.statusCode = recipe.$metadata.httpStatusCode;
    response.data = recipe;
    return response;
  } catch (err) {
    logger.error(err);
    throw new Error(err);
  }
}

function validateId(id, attr) {
  if (!id) {
    throw new Error(`Missing ${attr}`);
  }
}

function dataValidation(data) {
  if (Object.values(data).includes(undefined)) {
    throw new Error("Missing attribute(s)");
  }
}

module.exports = { getRecipes, createRecipe, editRecipe, removeRecipe };
