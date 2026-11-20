import { useState } from "react";
import { SvgFrame, MiniLabel, type PreviewProps } from "./PreviewFrame";

const stages = ["Корзина", "Заказ принят", "Заказ собран"];
export default function Market({ interactive = false }: PreviewProps) {
  const [step, select] = useState(0);
  const i = step % 3;
  return (
    <SvgFrame
      controls={
        interactive && (
          <>
            <span aria-live="polite">{stages[i]}</span>
            <button
              type="button"
              onClick={() => select((i + 1) % stages.length)}
            >
              {["Оформить заказ", "Отметить сборку", "Новый заказ"][i]}
            </button>
          </>
        )
      }
      label={"Макет заказа на фермерском рынке: " + stages[i]}
    >
      <rect width="480" height="184" fill="#19212b" />
      <g opacity=".34" stroke="#415269">
        {Array.from({ length: 17 }, (_, n) => (
          <path
            key={n}
            d={
              "M" +
              (-60 + n * 40) +
              " 185l131-94m-60 94L" +
              (-27 + n * 40) +
              " 89"
            }
            fill="none"
          />
        ))}
      </g>
      <g transform="translate(108 95)" className="market-crate">
        <path d="m-65-9 52-28 75 12-49 33Z" fill="#566b76" stroke="#8ca8ac" />
        {[
          [0, -16, 13],
          [-20, -9, 14],
          [19, -16, 12],
          [-38, -4, 11],
          [20, -4, 12],
          [3, -3, 14],
          [37, -12, 10],
        ].map(([x, y, r], n) => (
          <g key={n} transform={"translate(" + x + " " + y + ")"}>
            <circle
              r={r}
              fill={["#a86b51", "#b37d51", "#7f8d5b"][n % 3]}
              stroke="#655e4c"
            />
            <path
              d="m-3-8 2-5 2 4 5-1-3 4"
              stroke="#70845d"
              fill="none"
              strokeWidth="2"
            />
          </g>
        ))}
        <path d="m-65-10 79 16v40l-79-17Z" fill="#334c61" stroke="#7890a0" />
        <path d="M14 6 63-23v38L14 46Z" fill="#293d4d" stroke="#71858e" />
        <path
          d="m-61-2 71 15m-71-6 71 15m-71-6 71 15m9-20 40-24m-40 32 40-24m-40 33 40-24"
          stroke="#7b93a0"
          strokeWidth="2.4"
        />
        <path
          d="m-54-4 1 34m57-22v34m47-57v36"
          stroke="#3e5a6a"
          strokeWidth="4"
        />
      </g>
      <g transform="translate(219 28)">
        <rect width="225" height="127" rx="5" fill="#101822" stroke="#4b5b70" />
        <MiniLabel x={13} y={21} color="#a8bbcf">
          ЗАКАЗ / MARKET
        </MiniLabel>
        <path d="M12 30H213" stroke="#324354" />
        {stages.map((name, n) => (
          <g key={name} transform={"translate(17 " + (48 + n * 28) + ")"}>
            {n < 2 && <path d="M0 5v20" stroke="#4b647b" />}
            <circle
              cx="0"
              cy="0"
              r="4.5"
              fill={n <= i ? "#a3c5d3" : "#293847"}
              stroke="#7e9cad"
            />
            <text
              x="14"
              y="4"
              fontSize="11"
              fill={n <= i ? "#dbe4e9" : "#8c9cab"}
            >
              {name}
            </text>
            {n === i && (
              <g className="order-bars" fill="#a3c4d6">
                {[4, 9, 6, 12, 7].map((h, k) => (
                  <rect
                    key={k}
                    width="2"
                    height={h}
                    x={165 + k * 4}
                    y={5 - h}
                  />
                ))}
              </g>
            )}
          </g>
        ))}
      </g>
    </SvgFrame>
  );
}
