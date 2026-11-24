
export const initialOnboardingState = {
  step: 0,
  careerGoalId: null,
  experienceLevel: null
};

export function onboardingReducer(state, action) {
  switch (action.type) {
    case "SET_GOAL":
      return {
        ...state,
        careerGoalId: action.payload,
        experienceLevel: null
      };

    case "SET_EXPERIENCE":
      return {
        ...state,
        experienceLevel: action.payload
      };

    case "NEXT_STEP":
      return {
        ...state,
        step: Math.min(state.step + 1, 3)
      };

    case "PREVIOUS_STEP":
      return {
        ...state,
        step: Math.max(state.step - 1, 0)
      };

    case "RESET":
      return initialOnboardingState;

    default:
      return state;
  }
}
