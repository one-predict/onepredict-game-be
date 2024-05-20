const Or = (conditions: unknown[]) => {
  return { $or: conditions };
};

export default Or;
