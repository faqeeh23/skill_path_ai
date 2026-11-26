import { interfaceText } from "../../../lib/interfaceText";
import { useDemo } from "../../demo/store";
import { Header, Empty } from "../../../components/ui/SharedUi";

export default function Notifications() {
  const { state, dispatch } = useDemo();
  return (
    <>
      <Header
        title="Notifications"
        action={
          <button
            className="btn btn-outline"
            disabled={!state.notifications.some((n) => !n.read)}
            onClick={() =>
              dispatch({
                type: "PATCH",
                value: {
                  notifications: state.notifications.map((n) => ({
                    ...n,
                    read: true,
                  })),
                },
              })
            }
          >
            Mark all read
          </button>
        }
      >
        {" "}
        Updates from your learning workspace.{" "}
      </Header>
      {state.notifications.length ? (
        <div className="sp-panel">
          {state.notifications.map((n) => (
            <div className="sp-list-row" key={n.id}>
              <div>
                <strong>{interfaceText(n.text)}</strong>
                <p>{new Date(n.time).toLocaleString()}</p>
              </div>
              <span className="sp-tag">{n.read ? "Read" : "New"}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="You’re all caught up">
          Learning updates appear here when you enroll.
        </Empty>
      )}
    </>
  );
}
