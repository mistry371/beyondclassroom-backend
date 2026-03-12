'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, Plus, Minus, X } from 'lucide-react'

export default function MatrixCalculator() {
  const [matrixA, setMatrixA] = useState([[1, 2], [3, 4]])
  const [matrixB, setMatrixB] = useState([[5, 6], [7, 8]])
  const [result, setResult] = useState(null)
  const [operation, setOperation] = useState('add')

  const updateMatrix = (matrix, setMatrix, row, col, value) => {
    const newMatrix = [...matrix]
    newMatrix[row][col] = parseFloat(value) || 0
    setMatrix(newMatrix)
  }

  const addMatrices = (a, b) => {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]))
  }

  const subtractMatrices = (a, b) => {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]))
  }

  const multiplyMatrices = (a, b) => {
    const result = []
    for (let i = 0; i < a.length; i++) {
      result[i] = []
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j]
        }
        result[i][j] = sum
      }
    }
    return result
  }

  const calculateDeterminant = (matrix) => {
    if (matrix.length === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
    }
    return 0
  }

  const calculate = () => {
    try {
      let res
      switch (operation) {
        case 'add':
          res = addMatrices(matrixA, matrixB)
          break
        case 'subtract':
          res = subtractMatrices(matrixA, matrixB)
          break
        case 'multiply':
          res = multiplyMatrices(matrixA, matrixB)
          break
        case 'determinant':
          res = [[calculateDeterminant(matrixA)]]
          break
        default:
          res = matrixA
      }
      setResult(res)
    } catch (error) {
      alert('Error calculating. Check matrix dimensions.')
    }
  }

  const renderMatrix = (matrix, setMatrix, editable = true) => (
    <div className="inline-block bg-gray-50 p-4 rounded-lg">
      {matrix.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2">
          {row.map((val, j) => (
            <input
              key={j}
              type="number"
              value={val}
              onChange={(e) => editable && updateMatrix(matrix, setMatrix, i, j, e.target.value)}
              disabled={!editable}
              className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            />
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Grid3x3 className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Matrix Calculator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Matrix A</h3>
          {renderMatrix(matrixA, setMatrixA)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Matrix B</h3>
          {renderMatrix(matrixB, setMatrixB)}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setOperation('add')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            operation === 'add' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
        <button
          onClick={() => setOperation('subtract')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            operation === 'subtract' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Minus className="h-4 w-4" />
          Subtract
        </button>
        <button
          onClick={() => setOperation('multiply')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            operation === 'multiply' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          <X className="h-4 w-4" />
          Multiply
        </button>
        <button
          onClick={() => setOperation('determinant')}
          className={`px-4 py-2 rounded-lg ${
            operation === 'determinant' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          Det(A)
        </button>
      </div>

      <button
        onClick={calculate}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all mb-6"
      >
        Calculate
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Result</h3>
          {renderMatrix(result, () => {}, false)}
        </motion.div>
      )}
    </motion.div>
  )
}
