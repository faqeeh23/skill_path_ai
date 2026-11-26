import { useState } from "react";
import { useDemo } from "../../demo/store";

export function useDemoProfileForm() {
  const { state, dispatch } = useDemo();
  const [name, setName] = useState(state.user.name);
  const [bio, setBio] = useState(state.profile.bio);
  const [message, setMessage] = useState("");

  function saveProfile(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setMessage("Enter at least two characters for your name.");
      return;
    }

    dispatch({
      type: "PATCH",
      value: {
        user: { ...state.user, name: trimmedName },
        users: state.users.map((user) =>
          user.id === state.user.id ? { ...user, name: trimmedName } : user,
        ),
        profile: { bio },
      },
    });
    setMessage("profile saved.");
  }

  return { name, setName, bio, setBio, email: state.user.email, message, saveProfile };
}
