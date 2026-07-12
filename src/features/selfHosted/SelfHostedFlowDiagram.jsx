import { Icons } from "../../components/index.js";
import "./selfHostedFlowDiagram.css";

function FlowNode({ icon, title, detail, variant = "default" }) {
  return (
    <article className={`self-hosted-flow__node self-hosted-flow__node--${variant}`}>
      <span className="self-hosted-flow__node-icon" aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        {detail ? <span>{detail}</span> : null}
      </div>
    </article>
  );
}

export function SelfHostedFlowDiagram({ flow }) {
  return (
    <figure className="self-hosted-flow" aria-label={flow.ariaLabel}>
      <p className="sr-only">{flow.srSummary}</p>

      <div className="self-hosted-flow__outer">
        <div className="self-hosted-flow__outer-label">
          {Icons.privacy(18)}
          <span>{flow.boundary}</span>
        </div>

        <div className="self-hosted-flow__grid">
          <FlowNode
            icon={Icons.desktop(22)}
            title={flow.application}
            detail={flow.applicationDetail}
            variant="application"
          />

          <div className="self-hosted-flow__lanes" aria-hidden="true">
            <div className="self-hosted-flow__lane self-hosted-flow__lane--request">
              <span className="self-hosted-flow__lane-label">{flow.request}</span>
              <i className="self-hosted-flow__line self-hosted-flow__line--to-product" />
              <span className="self-hosted-flow__lane-note">{flow.requestNote}</span>
            </div>
            <div className="self-hosted-flow__lane self-hosted-flow__lane--response">
              <span className="self-hosted-flow__lane-label">{flow.response}</span>
              <i className="self-hosted-flow__line self-hosted-flow__line--to-app" />
            </div>
          </div>

          <div className="self-hosted-flow__product">
            <span className="self-hosted-flow__product-label">{flow.product}</span>
            <div className="self-hosted-flow__product-grid">
              <FlowNode icon={Icons.server(22)} title={flow.api} detail={flow.apiDetail} variant="api" />
              <div className="self-hosted-flow__link self-hosted-flow__link--job" aria-hidden="true">
                <span>{flow.toEngine}</span>
                <i className="self-hosted-flow__line self-hosted-flow__line--to-engine" />
              </div>
              <FlowNode icon={Icons.settings(22)} title={flow.engine} detail={flow.engineDetail} variant="engine" />
              <div className="self-hosted-flow__link self-hosted-flow__link--storage" aria-hidden="true">
                <i className="self-hosted-flow__line self-hosted-flow__line--two-way" />
                <span>{flow.storageLink}</span>
              </div>
              <FlowNode icon={Icons.file(22)} title={flow.storage} detail={flow.storageDetail} variant="storage" />
            </div>
          </div>

          <div className="self-hosted-flow__result-strip">
            <i className="self-hosted-flow__line self-hosted-flow__line--to-app" aria-hidden="true" />
            <span>{flow.responseStrip}</span>
          </div>
        </div>

        <p className="self-hosted-flow__data-note">
          {Icons.privacy(16)}
          <span>{flow.dataNote}</span>
        </p>
      </div>

      <figcaption className="self-hosted-flow__caption">{flow.caption}</figcaption>
    </figure>
  );
}
