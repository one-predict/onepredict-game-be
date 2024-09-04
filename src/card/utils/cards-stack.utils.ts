export const removeCardsFromStack = (targetStack: Record<string, number>, ...stacks: Array<Record<string, number>>) => {
  const newStack = { ...targetStack };

  for (const stack of stacks) {
    for (const [cardId, quantity] of Object.entries(stack)) {
      if (newStack[cardId] === undefined) {
        continue;
      }

      newStack[cardId] -= quantity;

      if (newStack[cardId] <= 0) {
        delete newStack[cardId];
      }
    }
  }

  return newStack as Record<string, number>;
};

export const addCardsToStack = (targetStack: Record<string, number>, ...stacks: Array<Record<string, number>>) => {
  const newStack = { ...targetStack };

  for (const stack of stacks) {
    for (const [cardId, quantity] of Object.entries(stack)) {
      newStack[cardId] = (newStack[cardId] || 0) + quantity;
    }
  }

  return newStack as Record<string, number>;
};

export const getStackSize = (stack: Record<string, number>) => {
  return Object.values(stack).reduce((previousCount, count) => previousCount + count, 0);
};
