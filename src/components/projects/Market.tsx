import { useState } from "react";
import { Sprout, ShoppingBasket, PackageCheck } from "lucide-react";
export default function Market({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [step, setStep] = useState(0);
  const labels = ["Товар", "Корзина", "Заказ"];
  return (
    <div className="viz market-viz">
      <span className="market-label">ALIZHMARKET / ORDER FLOW</span>
      <div className="market-flow">
        {[Sprout, ShoppingBasket, PackageCheck].map((Icon, i) => (
          <div
            className={"market-node " + (i === step ? "selected" : "")}
            key={labels[i]}
          >
            <Icon size={21} />
            <span>{labels[i]}</span>
          </div>
        ))}
      </div>
      {interactive && (
        <button
          className="preview-action"
          onClick={() => setStep((step + 1) % 3)}
        >
          {["Добавить в корзину", "Оформить заказ", "Новый заказ"][step]}
        </button>
      )}
    </div>
  );
}
