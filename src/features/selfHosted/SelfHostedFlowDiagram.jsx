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

function FlowConnector({ label, direction = "right" }) {
  return (
    <div className={`self-hosted-flow__connector self-hosted-flow__connector--${direction}`} aria-hidden="true">
      <span>{label}</span>
      <i />
    </div>
  );
}

export function SelfHostedFlowDiagram({ flow }) {
  return (
    <section className="self-hosted-flow" aria-label={flow.ariaLabel}>
      <div className="self-hosted-flow__boundary">
        <div className="self-hosted-flow__boundary-label">
          {Icons.privacy(18)}
          <span>{flow.boundary}</span>
        </div>

        <div className="self-hosted-flow__request-lane">
          <FlowNode icon={Icons.desktop(22)} title={flow.application} detail={flow.applicationDetail} variant="application" />
          <FlowConnector label={flow.request} />
          <FlowNode icon={Icons.settings(22)} title={flow.network} detail={flow.networkDetail} variant="network" />
          <FlowConnector label={flow.toApi} />
          <FlowNode icon={Icons.server(22)} title={flow.api} detail={flow.apiDetail} variant="api" />
        </div>

        <div className="self-hosted-flow__api-engine-connector" aria-hidden="true">
          <span>{flow.toEngine}</span>
          <i />
        </div>

        <div className="self-hosted-flow__processing-lane">
          <FlowNode icon={Icons.settings(22)} title={flow.engine} detail={flow.engineDetail} variant="engine" />
          <div className="self-hosted-flow__vertical-connector" aria-hidden="true"><i /></div>
          <FlowNode icon={Icons.file(22)} title={flow.storage} detail={flow.storageDetail} variant="storage" />
        </div>

        <div className="self-hosted-flow__result-lane">
          <FlowConnector label={flow.result} direction="left" />
          <span className="self-hosted-flow__result-note">{flow.resultDetail}</span>
        </div>
      </div>
      <p className="self-hosted-flow__summary">{flow.summary}</p>
    </section>
  );
}
