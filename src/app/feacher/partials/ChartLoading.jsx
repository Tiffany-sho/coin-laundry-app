import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

const ChartLoading = () => {
  // データポイントの高さ（パーセンテージ）
  const dataPoints = [40, 65, 45, 80, 55, 70, 50];

  return (
    <Box w="100%" h="600px" py={6} px={4}>
      <Stack gap={6} h="100%">
        {/* Y軸ラベルとグラフエリア */}
        <Flex gap={4} h="100%">
          {/* Y軸 */}
          <Stack gap={3} justify="space-between" w="40px">
            {[...Array(5)].map((_, i) => (
              <Skeleton
                key={`y-${i}`}
                height="12px"
                width="30px"
                borderRadius="md"
                startColor="gray.100"
                endColor="gray.200"
                animation={`fadeIn 0.8s ease-in ${i * 0.1}s infinite alternate`}
                sx={{
                  "@keyframes fadeIn": {
                    "0%": { opacity: 0.3 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            ))}
          </Stack>

          {/* グラフエリア */}
          <Box flex="1" position="relative" h="100%">
            {/* グリッド線 */}
            <Stack
              gap={0}
              h="100%"
              justify="space-between"
              position="absolute"
              w="100%"
              zIndex={0}
            >
              {[...Array(5)].map((_, i) => (
                <Box
                  key={`grid-${i}`}
                  h="1px"
                  bg="gray.200"
                  w="100%"
                  opacity={0.5}
                />
              ))}
            </Stack>

            {/* SVGで折れ線グラフを描画 */}
            <Box position="relative" w="100%" h="100%" zIndex={1}>
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                {/* 折れ線のパス */}
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.6">
                      <animate
                        attributeName="stop-opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.8">
                      <animate
                        attributeName="stop-opacity"
                        values="0.5;1;0.5"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6">
                      <animate
                        attributeName="stop-opacity"
                        values="0.3;0.8;0.3"
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </stop>
                  </linearGradient>
                </defs>

                {/* データポイント（ドット） */}
                {dataPoints.map((height, i) => {
                  const x = (i / (dataPoints.length - 1)) * 100;
                  const y = 100 - height;
                  return (
                    <g key={`point-${i}`}>
                      {/* 外側の円（パルス効果） */}
                      <circle
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="8"
                        fill="#14b8a6"
                        opacity="0.3"
                      >
                        <animate
                          attributeName="r"
                          values="8;12;8"
                          dur="1.5s"
                          begin={`${i * 0.15}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.3;0;0.3"
                          dur="1.5s"
                          begin={`${i * 0.15}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* 内側の円 */}
                      <circle cx={`${x}%`} cy={`${y}%`} r="4" fill="#14b8a6">
                        <animate
                          attributeName="opacity"
                          values="0.6;1;0.6"
                          dur="1.5s"
                          begin={`${i * 0.15}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </Box>
          </Box>
        </Flex>

        {/* X軸ラベル */}
        <Flex gap={4} justify="space-around" px={12}>
          {[...Array(7)].map((_, i) => (
            <Skeleton
              key={`x-${i}`}
              height="12px"
              width="40px"
              borderRadius="md"
              startColor="gray.100"
              endColor="gray.200"
              animation={`fadeIn 0.8s ease-in ${i * 0.1}s infinite alternate`}
            />
          ))}
        </Flex>

        {/* 凡例エリア（複数系列の場合） */}
        <Flex gap={4} justify="center" flexWrap="wrap">
          {[...Array(3)].map((_, i) => (
            <Flex key={`legend-${i}`} align="center" gap={2}>
              <Skeleton
                w="12px"
                h="12px"
                borderRadius="full"
                startColor="gray.100"
                endColor="gray.200"
              />
              <Skeleton
                height="12px"
                width="60px"
                borderRadius="md"
                startColor="gray.100"
                endColor="gray.200"
                animation={`fadeIn 0.8s ease-in ${
                  i * 0.15
                }s infinite alternate`}
              />
            </Flex>
          ))}
        </Flex>
      </Stack>
    </Box>
  );
};

export default ChartLoading;
