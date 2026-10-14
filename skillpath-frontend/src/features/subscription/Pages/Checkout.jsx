
import { Link, useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faCrown,
  faCalendarDays,
  faCreditCard,
  faCircleInfo,
  faArrowLeft,
  faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { subscriptionConfig } from "../plans";
import "../subscription.css";

export default function Checkout() {
  const [params] = useSearchParams();

  const plan = params.get("plan");
  const requestedBilling = params.get("billing");
  const validBilling = ["monthly", "yearly"].includes(requestedBilling);

  if (plan !== "pro" || !validBilling) {
    return (
      <section className="container checkout-page">
        <div className="checkout-card">
          <div className="checkout-status-icon error">
            <FontAwesomeIcon icon={faCircleExclamation} />
          </div>
          <h1>Invalid subscription selection</h1>
          <p>Please choose a valid plan from the pricing page.</p>
          <Link className="plan-button primary" to="/pricing">
            <FontAwesomeIcon icon={faArrowLeft} className="btn-icon-left" />
            <span>View plans</span>
          </Link>
        </div>
      </section>
    );
  }

  const billing = requestedBilling;
  const amount = subscriptionConfig.prices[billing];
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: subscriptionConfig.currency
  }).format(amount);

  return (
    <section className="container checkout-page">
      <div className="checkout-card">
        <span className="eyebrow">
          <FontAwesomeIcon icon={faReceipt} className="eyebrow-icon" />
          SUBSCRIPTION REVIEW
        </span>
        <h1>Review your plan</h1>
        <p>Confirm the plan details before continuing in a future release.</p>

        <div className="checkout-summary">
          <div>
            <span>Selected plan</span>
            <strong>
              <FontAwesomeIcon icon={faCrown} className="summary-icon" />
              SkillPath Pro
            </strong>
          </div>
          <div>
            <span>Billing cycle</span>
            <strong>
              <FontAwesomeIcon icon={faCalendarDays} className="summary-icon" />
              {billing === "monthly" ? "Monthly" : "Yearly"}
            </strong>
          </div>
          <div className="checkout-total">
            <span>Illustrative total</span>
            <strong>
              <FontAwesomeIcon icon={faCreditCard} className="summary-icon" />
              {formattedAmount}
            </strong>
          </div>
        </div>

        <div className="checkout-notice" role="status">
          <FontAwesomeIcon icon={faCircleInfo} className="notice-icon" />
          <div>
            Payment processing is not yet connected. No charge can be made
            and no subscription will be activated on this page.
          </div>
        </div>

        <Link to="/pricing" className="plan-button secondary">
          <FontAwesomeIcon icon={faArrowLeft} className="btn-icon-left" />
          <span>Change plan</span>
        </Link>
      </div>
    </section>
  );
}
