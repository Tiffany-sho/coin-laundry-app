import React from 'react';
import styles from './CoinDataRanking.module.css';

const RankingTable = ({ data }) => {
  const formatChange = (change) => {
    if (change > 0) return `+${change}`;
    if (change < 0) return `${change}`;
    return '±0';
  };

  const getChangeClass = (change) => {
    if (change > 0) return styles.positive;
    if (change < 0) return styles.negative;
    return styles.neutral;
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.mainColumn}>順位</th>
            <th className={styles.mainColumn}>名前</th>
            <th className={styles.mainColumn}>点数</th>
            <th className={styles.subColumn}>日付</th>
            <th className={styles.subColumn}>変化</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={styles.row}>
              <td className={styles.mainColumn}>
                <span className={styles.rank}>{item.rank}</span>
              </td>
              <td className={styles.mainColumn}>
                <span className={styles.name}>{item.name}</span>
              </td>
              <td className={styles.mainColumn}>
                <span className={styles.score}>{item.score}</span>
              </td>
              <td className={styles.subColumn}>
                <span className={styles.date}>{item.date}</span>
              </td>
              <td className={styles.subColumn}>
                <span className={`${styles.change} ${getChangeClass(item.change)}`}>
                  {formatChange(item.change)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RankingTable;

// 使用例:
//r
// 
// <RankingTable data={sampleData} />