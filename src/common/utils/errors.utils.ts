import { MongoError } from 'mongodb';

const DUPLICATED_ERROR_CODE = 11000;

export const isDuplicatedMongoError = (error: Error) => {
  return error instanceof MongoError && error.code === DUPLICATED_ERROR_CODE;
};
