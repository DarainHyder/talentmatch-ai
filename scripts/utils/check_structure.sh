#!/bin/bash

echo "===== Checking Project Structure ====="

# Check src/pages folder
echo "Checking pages folder..."
if [ -d "src/pages" ]; then
  echo "Pages folder exists."
else
  echo "Pages folder is missing! Create src/pages."
fi

# Required page files
pages=("LandingPage.jsx" "Dashboard.jsx")
for page in "${pages[@]}"; do
  if [ -f "src/pages/$page" ]; then
    echo "$page exists."
  else
    echo "$page is missing!"
  fi
done

# Check src/components folder
echo "Checking components folder..."
if [ -d "src/components" ]; then
  echo "Components folder exists."
else
  echo "Components folder is missing! Create src/components."
fi

# List required component files
components=("JobDescriptionInput.jsx" "CandidateUpload.jsx" "CandidateRanking.jsx" "InterviewQuestions.jsx" "ExportResults.jsx")
for comp in "${components[@]}"; do
  if [ -f "src/components/$comp" ]; then
    echo "$comp exists."
  else
    echo "$comp is missing!"
  fi
done

# Check utils folder
echo "Checking utils folder..."
if [ -d "src/utils" ]; then
  echo "Utils folder exists."
else
  echo "Utils folder is missing! Create src/utils."
fi

# Check api.js
if [ -f "src/utils/api.js" ]; then
  echo "api.js exists."
else
  echo "api.js is missing!"
fi

# Check App.jsx
if [ -f "src/App.jsx" ]; then
  echo "App.jsx exists."
else
  echo "App.jsx is missing!"
fi

# Optional: Check if LandingPage.jsx inside pages folder
if [ -f "src/pages/LandingPage.jsx" ]; then
  echo "LandingPage.jsx is correctly in src/pages."
else
  echo "LandingPage.jsx missing or in wrong folder!"
fi

echo "===== Done ====="
