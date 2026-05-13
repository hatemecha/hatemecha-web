import type { PortfolioSectionId } from "../data/portfolioSections";
import { visualAssets } from "../data/assets";

type FloatingImagesProps = {
  activeId: PortfolioSectionId;
};

export function FloatingImages({ activeId }: FloatingImagesProps) {
  return (
    <div className="floatingImages" data-active-image-set={activeId} aria-hidden="true">
      <img
        className="floatingImage floatingImageStrip"
        src={visualAssets.menuEyesStrip}
        alt=""
        draggable="false"
        loading="lazy"
      />
      <img
        className="floatingImage floatingImageBlock"
        src={visualAssets.menuPhotoBlock}
        alt=""
        draggable="false"
        loading="lazy"
      />
    </div>
  );
}
