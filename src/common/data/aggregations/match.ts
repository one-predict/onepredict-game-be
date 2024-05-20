import { PipelineStage } from 'mongoose';

const Match = (match: Record<string, unknown>): PipelineStage => {
  return {
    $match: match,
  };
};

export default Match;
