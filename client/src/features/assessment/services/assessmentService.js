
import { getQuestionsForGoal } from "../data/mockQuestions";

export async function createAssessment(goalId) {
  const questions = getQuestionsForGoal(goalId);

  if (!questions.length) {
    throw new Error("No demo questions available for this goal.");
  }

  return {
    attemptId: `demo-${Date.now()}`,
    questions: questions.map(question => Object.fromEntries(Object.entries(question).filter(([key]) => key !== 'correctIndex'))),
    totalQuestions: questions.length
  };
}

export async function evaluateAssessment(goalId, responses) {
  const questions = getQuestionsForGoal(goalId);

  const correctAnswers = responses.reduce((total, response) => {
    const question = questions.find(q => q.id === response.questionId);
    return total + (question?.correctIndex === response.selectedIndex ? 1 : 0);
  }, 0);

  return {
    demo: true,
    answered: responses.length,
    correctAnswers,
    totalQuestions: questions.length,
    percentage: Math.round((correctAnswers / questions.length) * 100)
  };
}
