import { useState } from "react";
import { SvgFrame, MiniLabel, type PreviewProps } from "./PreviewFrame";

const dishes = [
  { name: "Томатная пицца", time: "25 мин", tag: "ИТАЛЬЯНСКАЯ" },
  { name: "Зелёный салат", time: "15 мин", tag: "САЛАТЫ" },
];
function FoodArt({ salad }: { salad: boolean }) {
  return (
    <g transform="translate(110 88) rotate(-11)">
      <ellipse cx="2" cy="9" rx="64" ry="55" fill="#0f1412" opacity=".7" />
      <circle r="56" fill="#c4b79a" stroke="#eee0be" strokeWidth="2" />
      <circle r="49" fill="#393d32" stroke="#8f8066" strokeWidth="2" />
      {salad ? (
        <g>
          {Array.from({ length: 34 }, (_, n) => {
            const a = n * 2.4,
              r = 6 * Math.sqrt(n);
            return (
              <g
                key={n}
                transform={
                  "translate(" +
                  Math.cos(a) * r +
                  " " +
                  Math.sin(a) * r +
                  ") rotate(" +
                  n * 19 +
                  ")"
                }
              >
                <ellipse
                  rx="12"
                  ry="6"
                  fill={["#638044", "#9ca756", "#b5bd77"][n % 3]}
                />
                <path d="M-8 0h15" stroke="#475a39" />
              </g>
            );
          })}
        </g>
      ) : (
        <g>
          <circle r="44" fill="#d69550" stroke="#e6b074" strokeWidth="2" />
          <circle r="40.5" fill="#c26042" />
          <circle r="37" fill="#db994f" />
          {Array.from({ length: 15 }, (_, n) => {
            const a = n * 2.4,
              r = 8.6 * Math.sqrt(n);
            return (
              <g
                key={n}
                transform={
                  "translate(" +
                  r * Math.cos(a) +
                  " " +
                  r * Math.sin(a) +
                  ") rotate(" +
                  n * 41 +
                  ")"
                }
              >
                <ellipse
                  rx={n % 3 ? 5 : 8}
                  ry={n % 3 ? 4 : 5}
                  fill={n % 3 ? "#eace8a" : "#a84130"}
                />
                {n % 3 === 2 && (
                  <path d="M0 3Q-2-5 6-5Q11 1 0 3" fill="#495e3a" />
                )}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}
export default function Kitchen({ interactive = false }: PreviewProps) {
  const [step, select] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const saved = favorites.includes(step);
  const i = step % 2,
    dish = dishes[i];
  return (
    <SvgFrame
      controls={
        interactive && (
          <>
            <span aria-live="polite">{dish.name}</span>
            <button
              type="button"
              onClick={() => select((i + 1) % dishes.length)}
            >
              Другой рецепт
            </button>
            <button
              type="button"
              aria-pressed={saved}
              onClick={() =>
                setFavorites((prev) =>
                  saved ? prev.filter((n) => n !== i) : [...prev, i],
                )
              }
            >
              {saved ? "Убрать из избранного" : "Сохранить рецепт"}
            </button>
          </>
        )
      }
      label={"Макет приложения с рецептом «" + dish.name + "»"}
    >
      <rect width="480" height="184" fill="#251f1b" />
      <g stroke="#564536" opacity=".45">
        {Array.from({ length: 16 }, (_, n) => (
          <line key={n} x1={18 + n * 31} y1="0" x2={-36 + n * 31} y2="184" />
        ))}
      </g>
      <g className="recipe-plate">
        <FoodArt salad={i === 1} />
      </g>
      <g
        transform="translate(215 12) rotate(-3 90 80)"
        className="recipe-device"
      >
        <rect
          x="0"
          y="0"
          width="197"
          height="192"
          rx="19"
          stroke="#98765f"
          strokeWidth="1.5"
          fill="#151311"
        />
        <rect x="7" y="7" width="183" height="177" rx="14" fill="#24201b" />
        <rect x="77" y="10" width="43" height="5" rx="3" fill="#10100e" />
        <MiniLabel x={18} y={35} color="#b8a58d">
          КНИГА РЕЦЕПТОВ
        </MiniLabel>
        <text x="17" y="60" fill="#f5e6cd" fontSize="18" fontWeight="600">
          {dish.name}
        </text>
        <rect x="17" y="71" width="163" height="23" rx="3" fill="#3b3127" />
        <MiniLabel x={26} y={85} size={9} color="#e0bd91">
          {dish.time} / {dish.tag}
        </MiniLabel>
        <MiniLabel x={18} y={111} color="#a99c89">
          ИНГРЕДИЕНТЫ
        </MiniLabel>
        {(i === 0
          ? ["Томаты", "Моцарелла", "Базилик"]
          : ["Руккола", "Авокадо", "Лайм"]
        ).map((s, n) => (
          <g key={s}>
            <circle cx="21" cy={125 + n * 15} r="2.2" fill="#b78c55" />
            <text x="30" y={128 + n * 15} fontSize="10" fill="#e6d9bf">
              {s}
            </text>
          </g>
        ))}
      </g>
      <g transform="translate(155 126)" className="recipe-bookmark">
        <rect width="66" height="29" rx="6" fill="#40372b" stroke="#aa9274" />
        <path
          d="m10 9 7 0v11l-3.5-2.7L10 20Z"
          fill={saved ? "#ead0a2" : "none"}
          stroke="#efce9c"
        />
        <MiniLabel x={23} y={18} color="#e8cda3" size={8}>
          ОФЛАЙН
        </MiniLabel>
      </g>
    </SvgFrame>
  );
}
