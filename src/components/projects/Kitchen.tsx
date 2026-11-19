import { useState } from "react";
import { Bookmark, Utensils } from "lucide-react";
export default function Kitchen({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="viz kitchen-viz">
      <div className="recipe-screen">
        <div className="phone-top">
          <span>9:41</span>
          <i />
        </div>
        <div className="recipe-label">
          KITCHEN<span>APP</span>
        </div>
        <div className="dish-art">
          <i />
          <b />
          <em />
          <span />
          <small />
        </div>
        <div className="recipe-title">Паста с томатами</div>
        <div className="recipe-rule" />
        <div className="recipe-info">
          <Utensils size={8} /> 2 порции <span>20 мин</span>
        </div>
      </div>
      <div className={"save-chip " + (saved ? "saved" : "")}>
        <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        {saved ? "Сохранено" : "Избранное"}
      </div>
      {interactive && (
        <button className="preview-action" onClick={() => setSaved(!saved)}>
          {saved ? "Убрать из избранного" : "Сохранить рецепт"}
        </button>
      )}
    </div>
  );
}
