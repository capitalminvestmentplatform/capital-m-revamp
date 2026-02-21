export const totalPortfolio = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    datalabels: {
      color: "#000",
      font: { size: 12 },
    },
  },
};

export const portfolioValue = {
  responsive: true,
  maintainAspectRatio: false,

  // ✅ important for mobile/touch
  interaction: {
    mode: "nearest" as const,
    intersect: true,
  },

  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { boxWidth: 12 },
    },

    // ✅ tooltip will work on tap
    tooltip: {
      enabled: true,
      mode: "nearest" as const,
      intersect: true,
      callbacks: {
        label: (context: any) => {
          const value = Number(context.raw || 0);
          const data = (context.chart.data.datasets?.[0]?.data || []).map(
            (v: any) =>
              typeof v === "number" && !isNaN(v) ? v : Number(v) || 0,
          );
          const total = data.reduce((a: number, b: number) => a + b, 0);
          const pct = total ? (value / total) * 100 : 0;
          return `${context.label}: ${pct.toFixed(1)}%`;
        },
      },
    },

    // ✅ show % directly on the chart (so you don’t depend on tooltip)
    datalabels: {
      color: "#000",
      font: { size: 11, weight: "600" as const },
      clamp: true,
      formatter: (value: number, context: any) => {
        const dataset = (context.chart.data.datasets?.[0]?.data || []).map(
          (val: number) => (typeof val === "number" && !isNaN(val) ? val : 0),
        );
        const total = dataset.reduce(
          (acc: number, curr: number) => acc + curr,
          0,
        );
        if (!total || !value) return "";

        const pct = (value / total) * 100;

        // show only meaningful % to avoid overlap
        if (pct < 3) return "";

        return `${pct.toFixed(1)}%`;
      },
    },
  },

  cutout: "55%",
  radius: "95%",
};
