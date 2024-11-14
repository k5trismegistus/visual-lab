# Makefile
# To prepare Lambda functions for deployment

SRC_DIR := ../api
DIST_DIR := lib/lambda_dist

VENDOR_DIR := ${DIST_DIR}/vendor

PIP_CMD := pwd && pip install -r $(DIST_DIR)/requirements.txt -t $(VENDOR_DIR)

# Copy Lambda functions and install dependencies
prepare_lambda: clean_lambda
	@echo "Copying Lambda functions to $(DIST_DIR)..."
	mkdir -p $(DIST_DIR)
	touch $(DIST_DIR)/.gitkeep
	cp -r $(SRC_DIR)/handlers $(DIST_DIR)
	cp -r $(SRC_DIR)/models $(DIST_DIR)
	cp -r $(SRC_DIR)/utils $(DIST_DIR)
	cp -r $(SRC_DIR)/requirements.txt $(DIST_DIR)
	@echo "Installing dependencies..."
	mkdir -p $(VENDOR_DIR)
	$(PIP_CMD)
	@echo "Lambda functions prepared in $(DIST_DIR)"

deploy:
	@echo "Deploying Lambda functions..."
	npx cdk --profile personal deploy

# Clean up Lambda Dist directory
clean_lambda:
	@echo "Cleaning up $(DIST_DIR)..."
	rm -rf $(DIST_DIR)

all: clean_lambda prepare_lambda deploy
