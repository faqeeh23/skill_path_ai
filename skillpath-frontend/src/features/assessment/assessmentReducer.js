
export const initialAssessmentState = {
  phase: "intro",
  attemptId: null,
  questions: [],
  currentIndex: 0,
  selectedIndex: null,
  responses: [],
  result: null,
  error: ""
};

export function assessmentReducer(state, action) {
  switch (action.type) {
    case "START_LOADING":
      return { ...initialAssessmentState, phase: "loading" };

    case "START_SUCCESS":
      return {
        ...state,
        phase: "question",
        attemptId: action.payload.attemptId,
        questions: action.payload.questions
      };

    case "SELECT_ANSWER":
      return {
        ...state,
        selectedIndex: action.payload,
        error: ""
      };

    case "ANSWER_SUBMITTED": {
      if (state.selectedIndex === null) return state;

      const question = state.questions[state.currentIndex];
      const responses = [
        ...state.responses,
        {
          questionId: question.id,
          selectedIndex: state.selectedIndex
        }
      ];

      const isLast = state.currentIndex === state.questions.length - 1;

      return {
        ...state,
        responses,
        selectedIndex: null,
        currentIndex: isLast ? state.currentIndex : state.currentIndex + 1,
        phase: isLast ? "submitting" : "question"
      };
    }

    case "RESULT_SUCCESS":
      return {
        ...state,
        phase: "completed",
        result: action.payload
      };

    case "ERROR":
      return {
        ...state,
        phase: "error",
        error: action.payload
      };

    case "RESET":
      return initialAssessmentState;

    default:
      return state;
  }
}
