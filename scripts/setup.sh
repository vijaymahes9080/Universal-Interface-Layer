#!/bin/bash
# Universal Interface Layer (UIL) Unix/macOS Setup Script

set -e

echo -e "\033[0;36m=============================================\033[0m"
echo -e "\033[0;36mSetting up Universal Interface Layer (UIL)...\033[0m"
echo -e "\033[0;36m=============================================\033[0m"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# 1. Setup Python Backend Virtual Environment
echo -e "\n\033[0;32m[1/3] Creating Python Virtual Environment...\033[0m"
cd "$PROJECT_ROOT/apps/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "\033[0;33mVirtual environment 'venv' created.\033[0m"
else
    echo -e "\033[0;33mVirtual environment 'venv' already exists.\033[0m"
fi

# Activate and install dependencies
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# 2. Setup Node packages in frontend
echo -e "\n\033[0;32m[2/3] Installing Node packages in React frontend...\033[0m"
cd "$PROJECT_ROOT/apps/frontend"
npm install

# 3. Setup Complete
echo -e "\n\033[0;36m=============================================\033[0m"
echo -e "\033[0;32mSetup Completed Successfully!\033[0m"
echo -e "\033[0;36m=============================================\033[0m"
echo -e "\nTo start UIL backend core server:"
echo -e "  cd apps/backend"
echo -e "  source venv/bin/activate"
echo -e "  python -m apps.backend.main"

echo -e "\nTo start UIL frontend dashboard client:"
echo -e "  cd apps/frontend"
echo -e "  npm run dev"
echo -e "\nAccess the browser dashboard at http://localhost:3000"
