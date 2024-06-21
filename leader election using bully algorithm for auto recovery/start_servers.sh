#!/bin/bash

# Start all processes
npx ts-node src/index.ts 1 & P1=$!
npx ts-node src/index.ts 2 & P2=$!
npx ts-node src/index.ts 3 & P3=$!
npx ts-node src/index.ts 4 & P4=$!
npx ts-node src/index.ts 5 & P5=$!

echo "Processes started: $P1 $P2 $P3 $P4 $P5"

# Function to stop a specific process
function stop_process() {
    echo "Stopping process $1..."
    kill -SIGTERM ${!1} 2>/dev/null
}

# Function to stop all processes
function stop_all_processes() {
    echo "Stopping all processes..."
    kill -SIGTERM $P1 $P2 $P3 $P4 $P5 2>/dev/null
}

# Wait for commands to control processes
while true; do
    echo "Enter 'stop <P1|P2|P3|P4|P5>' to stop a specific process, 'stop all' to stop all processes, or 'exit' to quit."
    read -r cmd arg
    case "$cmd" in
        stop)
            if [ "$arg" == "all" ]; then
                stop_all_processes
            else
                stop_process $arg
            fi
            ;;
        exit)
            stop_all_processes
            break
            ;;
        *)
            echo "Invalid command"
            ;;
    esac
done

echo "Script ended. All processes stopped."
