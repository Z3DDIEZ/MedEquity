import type { BodyRegion } from "../types";

/**
 * Props for the HumanBodyMap interactive SVG component.
 *
 * @param activeRegion - The currently selected body region, or null if none.
 * @param onRegionSelect - Callback fired when a region is clicked.
 */
interface HumanBodyMapProps {
  activeRegion: BodyRegion | null;
  onRegionSelect: (region: BodyRegion | null) => void;
}

/**
 * Interactive 2D human body silhouette for symptom region filtering.
 * Clicking a region highlights it and calls onRegionSelect.
 * Clicking the active region again deselects it (passes null).
 */
export default function HumanBodyMap({
  activeRegion,
  onRegionSelect,
}: HumanBodyMapProps): React.JSX.Element {
  function handleClick(region: BodyRegion): void {
    onRegionSelect(activeRegion === region ? null : region);
  }

  function regionClass(region: BodyRegion): string {
    return `body-region ${activeRegion === region ? "active" : ""}`;
  }

  return (
    <div className="body-map-container" role="img" aria-label="Interactive body map for symptom selection">
      <svg
        viewBox="0 0 200 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="body-map-svg"
      >
        {/* Head */}
        <g
          className={regionClass("head")}
          onClick={() => handleClick("head")}
          role="button"
          tabIndex={0}
          aria-label="Head region"
          onKeyDown={(e) => e.key === "Enter" && handleClick("head")}
        >
          <circle cx="100" cy="45" r="30" />
          <text x="100" y="49" textAnchor="middle" className="body-region-label">
            Head
          </text>
        </g>

        {/* Chest */}
        <g
          className={regionClass("chest")}
          onClick={() => handleClick("chest")}
          role="button"
          tabIndex={0}
          aria-label="Chest region"
          onKeyDown={(e) => e.key === "Enter" && handleClick("chest")}
        >
          <rect x="60" y="80" width="80" height="75" rx="14" />
          <text x="100" y="122" textAnchor="middle" className="body-region-label">
            Chest
          </text>
        </g>

        {/* Abdomen */}
        <g
          className={regionClass("abdomen")}
          onClick={() => handleClick("abdomen")}
          role="button"
          tabIndex={0}
          aria-label="Abdomen region"
          onKeyDown={(e) => e.key === "Enter" && handleClick("abdomen")}
        >
          <rect x="65" y="160" width="70" height="65" rx="12" />
          <text x="100" y="197" textAnchor="middle" className="body-region-label">
            Abdomen
          </text>
        </g>

        {/* Left Arm */}
        <g
          className={regionClass("arms")}
          onClick={() => handleClick("arms")}
          role="button"
          tabIndex={0}
          aria-label="Arms region"
          onKeyDown={(e) => e.key === "Enter" && handleClick("arms")}
        >
          <rect x="18" y="88" width="36" height="110" rx="14" />
          <text x="36" y="148" textAnchor="middle" className="body-region-label body-region-label--small">
            Arm
          </text>
        </g>

        {/* Right Arm */}
        <g
          className={regionClass("arms")}
          onClick={() => handleClick("arms")}
          aria-hidden="true"
        >
          <rect x="146" y="88" width="36" height="110" rx="14" />
          <text x="164" y="148" textAnchor="middle" className="body-region-label body-region-label--small">
            Arm
          </text>
        </g>

        {/* Left Leg */}
        <g
          className={regionClass("legs")}
          onClick={() => handleClick("legs")}
          role="button"
          tabIndex={0}
          aria-label="Legs region"
          onKeyDown={(e) => e.key === "Enter" && handleClick("legs")}
        >
          <rect x="62" y="232" width="32" height="140" rx="14" />
          <text x="78" y="308" textAnchor="middle" className="body-region-label body-region-label--small">
            Leg
          </text>
        </g>

        {/* Right Leg */}
        <g
          className={regionClass("legs")}
          onClick={() => handleClick("legs")}
          aria-hidden="true"
        >
          <rect x="106" y="232" width="32" height="140" rx="14" />
          <text x="122" y="308" textAnchor="middle" className="body-region-label body-region-label--small">
            Leg
          </text>
        </g>
      </svg>

      {/* Region hint */}
      <p className="body-map-hint">
        {activeRegion
          ? `Showing ${activeRegion} symptoms · click again to reset`
          : "Tap a body area to filter symptoms"}
      </p>
    </div>
  );
}
