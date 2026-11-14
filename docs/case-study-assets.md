# Case-study images — where to put them

Ambient AI and Self-Ready pick up their images automatically. Put a file at the
path below, commit, and the next deploy shows it: no code change. Until then
each spot shows a labelled placeholder of the same shape.

Screenshots can be `.webp`, `.png`, `.jpg` or `.avif` (WebP preferred, about
2400px wide). Nothing is cropped: every image keeps its own proportions and
opens larger on click.

The user flow and product architecture diagrams are drawn in code from
`journey` and `architecture` in each study file — edit the text there.

## Ambient AI — `public/images/case-studies/ambient-ai/`

| File | Shows | Where it appears |
| --- | --- | --- |
| `screens/aa-platform-overview` | Management Portal | hero (overview + case study) |
| `screens/aa-gateway-mao` | Gateway / MAO configuration | 01 Structuring the platform |
| `screens/aa-agent-workspace` | Agent workspace, split screen | 02 Agent configuration |
| `screens/aa-skill-registry` | Skill Registry, launch parameters | 03 Skills and workflows |
| `screens/aa-workflow-builder` | Workflow Builder | 03 Skills and workflows |
| `screens/aa-preflight` | Pre-flight validation | 04 Validation |
| `screens/aa-deployment` | Publishing, deployment status, execution logs | 05 Deployment and version control |

## Self-Ready — `public/images/case-studies/self-ready/`

| File | Shows | Where it appears |
| --- | --- | --- |
| `screens/sr-workbench` | Self-Ready Workbench | hero (overview + case study) |
| `screens/sr-ingestion` | Manual Bulk Ingestion and Scheduled Image Capture | 01 Image ingestion |
| `screens/sr-ingestion-history` | Ingestion History | 01 Image ingestion |
| `screens/sr-capture-sessions` | Capture Sessions | 02 Capture sessions |
| `screens/sr-image-review` | Image Review: crop, shelf label, Confirm / Reject | 03 Human validation |
| `screens/sr-blocklist` | Blocklist states | 04 Blocklist |
| `screens/sr-product-database` | Product Database | 05 Image lifecycle |
| `screens/sr-product-details` | Active / Seasonal / Inactive images | 05 Image lifecycle |
| `screens/sr-on-device-index` | On-device Index | 06 Device model |

Copy lives in `lib/site/studies/ambientAi.ts` and `lib/site/studies/selfReady.ts`;
captions are next to each screen there.

## Later

- Cover preview videos (20–30 s) and the full 4–5 minute case-study videos are
  planned once the screenshots are in.
