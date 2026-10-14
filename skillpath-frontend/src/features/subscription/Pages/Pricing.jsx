import { useState } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTags,
    faCalendarDays,
    faCalendarCheck,
    faTag,
    faSeedling,
    faCrown,
    faGem,
    faCircleCheck,
    faArrowRight,
    faBolt,
    faCircleInfo
} from "@fortawesome/free-solid-svg-icons";
import {
    subscriptionConfig, subscriptionFeatures
} from "../plans";

import "../subscription.css";

export default function Pricing() {
    const [billing, setBilling] = useState("monthly");
    const { trialDays, prices, currency } = subscriptionConfig;

    const price = prices[billing];
    const monthlyYearLyEquivalent = prices.yearly / 12;

    const saving = Math.round(
        (1 - prices.yearly / (prices.monthly * 12)) * 100
    );

    const formatPrice = amount => 
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency
        }).format(amount);
    
    return (
        <div className="pricing-page">
            <div className="pricing-ambient" aria-hidden="true" />

            <section className="container pricing-header">
                <span className="eyebrow">
                    <FontAwesomeIcon icon={faTags} className="eyebrow-icon" />
                    SIMPLE & TRANSPARENT
                </span>
                <h1>Invest in your future.</h1>
                <p>
                    Start learning for free, then choose the plan that keeps you moving forward.
                </p>

                <div className="billing-switch" aria-label="Billing frequency">
                    <button 
                        type="button"
                        className={billing === "monthly" ? "active" : ""}
                        aria-pressed={billing === "monthly"}
                        onClick={() => setBilling("monthly")}
                    >
                        <FontAwesomeIcon icon={faCalendarDays} className="switch-icon" />
                        <span>Monthly</span>
                    </button>
                    <button
                        type="button"
                        className={billing === "yearly" ? "active" : ""}
                        aria-pressed={billing === "yearly"}
                        onClick={() => setBilling("yearly")}
                    >
                        <FontAwesomeIcon icon={faCalendarCheck} className="switch-icon" />
                        <span>Yearly</span>
                        <span className="save-badge">
                            <FontAwesomeIcon icon={faTag} /> Save {saving}%
                        </span>
                    </button>
                </div>
            </section>
            <section className="container pricing-grid" aria-label="Subscription plans">
                <article className="plan-card">
                  <span className="plan-kicker">
                    <FontAwesomeIcon icon={faSeedling} className="plan-kicker-icon" />
                    EXPLORE FIRST
                  </span>
                  <h2>Free Trial</h2>
                  <p>Discover what personalized learning can do for you.</p>

                  <div className="plan-price">
                    <strong>{formatPrice(0)}</strong>
                    <span>for {trialDays} days</span>
                  </div>

                  <Link to="/register" className="plan-button secondary">
                    <span>Start free trial</span>
                    <FontAwesomeIcon icon={faArrowRight} className="btn-icon-right" aria-hidden="true" />
                  </Link>

                  <ul className="plan-features">
                    {subscriptionFeatures.map(feature => (
                      <li key={feature}>
                        <FontAwesomeIcon icon={faCircleCheck} className="feature-check" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
                
                <article className="plan-card featured">
                  <div className="featured-banner">
                    <FontAwesomeIcon icon={faCrown} className="featured-banner-icon" />
                    CONTINUE YOUR GROWTH
                  </div>
                  <span className="plan-kicker">
                    <FontAwesomeIcon icon={faGem} className="plan-kicker-icon" />
                    FOR YOUR LONG-TERM GOALS
                  </span>
                  <h2>SkillPath Pro</h2>
                  <p>Keep learning with AI-powered support and guidance.</p>
                
                  <div className="plan-price">
                    <strong>{formatPrice(price)}</strong>
                    <span>/{billing === "monthly" ? "month" : "year"}</span>
                  </div>
                
                  {billing === "yearly" && (
                    <p className="price-note">
                      Equivalent to {formatPrice(monthlyYearLyEquivalent)}/month, billed yearly.
                    </p>
                  )}

                  <Link
                    to={`/checkout?plan=pro&billing=${billing}`}
                    className="plan-button primary"
                  >
                    <span>Choose Pro</span>
                    <FontAwesomeIcon icon={faBolt} className="btn-icon-right" aria-hidden="true" />
                  </Link>
              
                  <ul className="plan-features">
                    {subscriptionFeatures.map(feature => (
                      <li key={feature}>
                        <FontAwesomeIcon icon={faCircleCheck} className="feature-check" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </article>
            </section>

            <div className="container pricing-disclaimer">
              <p>
                <FontAwesomeIcon icon={faCircleInfo} className="disclaimer-icon" aria-hidden="true" />
                <span>
                  Pricing shown is illustrative and not a live payment offer.
                  Payments and subscription activation are not yet available.
                </span>
              </p>
            </div>
        </div>
  );
}