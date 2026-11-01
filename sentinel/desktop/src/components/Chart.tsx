import { memo, useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import {
  candles,
  tokens,
  price,
  type Token,
  type State,
  type DesktopPreferences,
} from "../domain";
import { useSession } from "../context";
interface ChartProps {
  token?: Token;
  mini?: boolean;
  line?: boolean;
}
export const Chart = memo(function Chart(props: ChartProps) {
  const { state, desktop } = useSession();
  return <ChartSurface {...props} state={state} desktop={desktop} />;
});
export const ChartSurface = memo(function ChartSurface({
  token = tokens[0],
  mini = false,
  line = false,
  state,
  desktop,
}: ChartProps & { state: State; desktop: DesktopPreferences }) {
  const container = useRef<HTMLDivElement>(null),
    api = useRef<IChartApi | null>(null),
    series = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(
      null,
    );
  const [tooltip, setTooltip] = useState("");
  const interval = { "1m": 60, "5m": 300, "15m": 900, "1h": 3600 }[
    desktop.timeframe
  ];
  useEffect(() => {
    if (!container.current) return;
    const light = state.settings.theme === "Light",
      fg = light ? "#5b636b" : "#a1a8ae";
    const chart = createChart(container.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: fg,
        fontFamily: "Manrope Variable, Segoe UI, sans-serif",
        fontSize: 12,
        attributionLogo: !mini,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: light ? "#dce0e5" : "#252b30", visible: !mini },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "#8299aa", labelVisible: !mini },
        horzLine: { color: "#8299aa", labelVisible: !mini },
      },
      rightPriceScale: {
        visible: !mini,
        borderVisible: false,
        scaleMargins: { top: 0.13, bottom: 0.22 },
      },
      timeScale: {
        visible: !mini,
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: desktop.chartDensity,
      },
      handleScale: !mini,
      handleScroll: !mini,
    });
    api.current = chart;
    const format = {
      type: "price" as const,
      precision: token.price < 0.001 ? 7 : 5,
      minMove: token.price < 0.001 ? 0.0000001 : 0.00001,
    };
    const data = candles(token, state.step, interval).map((c) => ({
      ...c,
      time: c.time as UTCTimestamp,
    }));
    const primary =
      line || mini || state.settings.chartStyle === "Line"
        ? chart.addSeries(LineSeries, {
            color: state.settings.accent,
            lineWidth: 2,
            priceFormat: format,
            priceLineVisible: !mini,
            lastValueVisible: !mini,
          })
        : chart.addSeries(CandlestickSeries, {
            upColor: state.settings.profit,
            downColor: state.settings.loss,
            borderVisible: false,
            wickUpColor: state.settings.profit,
            wickDownColor: state.settings.loss,
            priceFormat: format,
          });
    primary.setData(data.map((c) => ({ ...c, value: c.close })));
    series.current = primary;
    if (!mini) {
      const volume = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        lastValueVisible: false,
        priceLineVisible: false,
      });
      volume
        .priceScale()
        .applyOptions({ scaleMargins: { top: 0.83, bottom: 0 } });
      volume.setData(
        data.map((c) => ({
          time: c.time,
          value: c.volume,
          color: c.close >= c.open ? "#72b39432" : "#d78d8332",
        })),
      );
    }
    chart.timeScale().fitContent();
    chart.subscribeCrosshairMove((p) => {
      const point = p.seriesData.get(primary);
      if (!p.time || !point) {
        setTooltip("");
        return;
      }
      const c = point as {
        open?: number;
        high?: number;
        low?: number;
        close?: number;
        value?: number;
      };
      setTooltip(
        c.open !== undefined
          ? `O ${price(c.open)}   H ${price(c.high!)}   L ${price(c.low!)}   C ${price(c.close!)}`
          : price(c.value ?? 0),
      );
    });
    return () => {
      chart.remove();
      api.current = null;
      series.current = null;
    };
  }, [
    token.id,
    mini,
    line,
    interval,
    state.settings.theme,
    state.settings.chartStyle,
    state.settings.accent,
    state.settings.profit,
    state.settings.loss,
  ]);
  useEffect(() => {
    api.current?.timeScale().applyOptions({ barSpacing: desktop.chartDensity });
  }, [desktop.chartDensity]);
  useEffect(() => {
    const last = candles(token, state.step, interval).at(-1)!;
    series.current?.update({
      ...last,
      time: last.time as UTCTimestamp,
      value: last.close,
    });
  }, [state.step, token.id, interval]);
  return (
    <div className={`chart-host ${mini ? "mini-chart" : ""}`}>
      <div
        ref={container}
        className="chart-canvas"
        role="img"
        aria-label={`${token.symbol} synthetic ${line ? "line" : "candlestick"} chart`}
      />
      {!mini && (
        <div className="ohlc">
          {tooltip || `${token.symbol} · SYNTHETIC OHLC · ${desktop.timeframe}`}
        </div>
      )}
    </div>
  );
});
