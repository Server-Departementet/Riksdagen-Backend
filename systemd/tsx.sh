#!/bin/bash

# Load NVM properly
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Change to project directory
cd "$HOME/Riksdagen-Backend" || exit 1

# Run the script passed as argument
exec yarn tsx "$@"
