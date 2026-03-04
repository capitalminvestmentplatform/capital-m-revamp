import { portfolioValue, totalPortfolio } from "@/types/charts";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Pie } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  ChartDataLabels,
);

interface ChartsProps {
  type: "Bar" | "Pie";
  dataset1: any; // Replace 'any' with the appropriate type for dataset
  dataset2?: any; // Replace 'any' with the appropriate type for dataset
  labels: string[]; // Add the 'labels' property with an appropriate type
  colors?: string[]; // Add the 'labels' property with an appropriate type
}

const Charts = ({ type, dataset1, dataset2, labels, colors }: ChartsProps) => {
  if (type === "Bar") {
    return (
      <TotalPortfolioBarChart
        labels={labels}
        dataset1={dataset1}
        dataset2={dataset2}
      />
    );
  }
  if (type === "Pie") {
    return (
      <div className="w-full h-[280px] sm:h-[320px] md:h-[350px]">
        <Pie
          options={portfolioValue as any}
          data={{
            labels,
            datasets: [
              {
                data: dataset1.data,
                backgroundColor: colors,
                borderColor: "#fff", // ✅ slice separation
                borderWidth: 2,
                spacing: 2, // ✅ slice spacing (Chart.js v3+)
              },
            ],
          }}
        />
      </div>
    );
  }

  return;
};

export default Charts;

type Props = {
  labels: string[];
  dataset1: { label: string; data: number[] }; // Market Value
  dataset2: { label: string; data: number[] }; // Cost Price
};

const formatNumber = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v || 0);
  return n.toLocaleString("en-US");
};

const formatCompact = (v: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

function TotalPortfolioBarChart({ labels, dataset1, dataset2 }: Props) {
  const filteredData = labels
    .map((label, index) => ({
      label,
      value1: dataset1.data[index] ?? 0,
      value2: dataset2.data[index] ?? 0,
    }))
    .filter((item) => !(item.value1 === 0 && item.value2 === 0));

  const filteredLabels = filteredData.map((item) => item.label);
  const filteredDataset1 = filteredData.map((item) => item.value1);
  const filteredDataset2 = filteredData.map((item) => item.value2);

  // ✅ mobile detection (client component)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 640px)").matches;

  // ✅ convert to percentage values for mobile
  // We calculate % per category (row):
  // Market% = market / (market + cost)
  // Cost%   = cost   / (market + cost)
  const percentDataset1 = filteredData.map((item) => {
    const total = (item.value1 || 0) + (item.value2 || 0);
    return total > 0 ? (item.value1 / total) * 100 : 0;
  });

  const percentDataset2 = filteredData.map((item) => {
    const total = (item.value1 || 0) + (item.value2 || 0);
    return total > 0 ? (item.value2 / total) * 100 : 0;
  });

  const displayDataset1 = isMobile ? percentDataset1 : filteredDataset1;
  const displayDataset2 = isMobile ? percentDataset2 : filteredDataset2;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    layout: { padding: { left: 8, right: 24, top: 8, bottom: 8 } },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw ?? 0;

            // ✅ On mobile show % + real value in tooltip (best UX)
            if (isMobile) {
              const idx = context.dataIndex;
              const actual =
                context.datasetIndex === 0
                  ? filteredDataset1[idx]
                  : filteredDataset2[idx];

              return `${context.dataset.label}: ${raw.toFixed(1)}% (${formatNumber(
                actual,
              )})`;
            }

            // ✅ Desktop: show absolute
            return `${context.dataset.label}: ${formatNumber(raw)}`;
          },
        },
      },
      datalabels: {
        clamp: false, // ✅ allow drawing outside
        clip: false, // ✅ don't cut the text
        anchor: (ctx: any) => {
          const v = ctx.dataset.data[ctx.dataIndex] ?? 0;
          // if bar is small, anchor at end so it can go outside
          return v < 200000 ? "end" : "center";
        },
        align: (ctx: any) => {
          const v = ctx.dataset.data[ctx.dataIndex] ?? 0;
          // small bar => place label to the right
          return v < 200000 ? "right" : "center";
        },
        offset: (ctx: any) => {
          const v = ctx.dataset.data[ctx.dataIndex] ?? 0;
          return v < 200000 ? 6 : 0;
        },
        formatter: (_: number, context: any) => {
          const idx = context.dataIndex;
          const datasetIndex = context.datasetIndex;

          const actual =
            datasetIndex === 0 ? filteredDataset1[idx] : filteredDataset2[idx];

          const total =
            (filteredDataset1[idx] || 0) + (filteredDataset2[idx] || 0);
          const pct = total > 0 ? (actual / total) * 100 : 0;

          return `${formatCompact(actual)} (${pct.toFixed(0)}%)`;
        },
        color: (context: any) => {
          // ✅ when label goes outside, always use dark text for readability
          const v = context.dataset.data[context.dataIndex] ?? 0;
          if (v < 200000) return "#111827"; // gray-900
          return context.datasetIndex === 0 ? "#FFFFFF" : "#000000";
        },
        font: { weight: "500" as const },
      },

      title: {
        display: false,
      },
    },
    scales: {
      x: isMobile
        ? {
            min: 0,
            max: 100,
            ticks: {
              callback: (v: any) => `${v}%`,
            },
          }
        : {
            ticks: {
              callback: (v: any) => formatNumber(v),
            },
          },

      y: {
        ticks: {
          // ✅ Keep labels as category names, not numbers
          callback: (value: any) => value,
        },
      },
    },
  };

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        label: dataset1.label,
        data: displayDataset1,
        borderColor: "#386264",
        backgroundColor: "#386264",
      },
      {
        label: dataset2.label,
        data: displayDataset2,
        borderColor: "#b2d8b8",
        backgroundColor: "#b2d8b8",
      },
    ],
  };

  return (
    <div style={{ height: 400 }}>
      <Bar options={options} data={data} />
    </div>
  );
}
