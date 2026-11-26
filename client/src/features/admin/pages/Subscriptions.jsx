import { faCreditCard, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { Header, Icon } from "../../../components/ui/SharedUi";
import { useDemo } from "../../demo/store";

export default function Subscriptions() {
  const { state } = useDemo();
  return (
    <div className="admin-overview">
      <Header title={<><Icon icon={faCreditCard} /> Subscriptions</>}>
        Review the access plan configured for this demo.
      </Header>
      <p className="admin-data-note">Demo data</p>
      <div className="admin-overview-grid">
        <section className="admin-overview-panel">
          <header><h2><Icon icon={faCreditCard} /> Access plan</h2></header>
          <dl className="admin-activity">
            <div><dt>Current plan</dt><dd>{state.subscription === "pro" ? "Pro" : "Free trial"}</dd></div>
          </dl>
        </section>
        <section className="admin-overview-panel">
          <header><h2><Icon icon={faReceipt} /> Billing</h2></header>
          <p className="admin-panel-copy">Billing integration is pending. This workspace does not process payments.</p>
        </section>
      </div>
    </div>
  );
}
