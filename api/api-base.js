"use strict";
const path = require("path");
const constants = require(path.join(__dirname, "../constants"));

const extractPage = (req) => {
  const {
    pageNo = 1,
    pageSize = 10,
    serverPaging = true,
    limit,
    skip
  } = req.query;

  // If serverPaging is disabled, return null
  if (!serverPaging || serverPaging == "false") {
    return null;
  }

  // Convert pageNo and pageSize to numbers to ensure correct calculation
  const pageNoNum = Number(pageNo);
  const pageSizeNum = Number(pageSize);
  
  // Prioritize direct limit/skip if provided
  if (limit || skip !== undefined) {
    return {
      limit: Number(limit || pageSizeNum),
      skip: Number(skip || 0),
      pageNo: pageNoNum,
      pageSize: pageSizeNum
    };
  }

  // Default pagination calculation
  return {
    pageNo: pageNoNum,
    limit: pageSizeNum,
    skip: pageSizeNum * (pageNoNum - 1),
    pageSize: pageSizeNum
  };
};

module.exports = (__dirname, serviceName, mapperName, coreDirname) => {
  let name = serviceName;
  mapperName = mapperName || name;

  // Resolve the service from __dirname
  const entityService = require(path.normalize(__dirname + "/../services"))[name];

  // Check if coreDirname is provided; prefer coreDirname for the mapper path
  const mapperDir = coreDirname ? coreDirname : __dirname;
  const entityMapper = require(path.normalize(mapperDir + "/../mappers"))[mapperName];

  if (!entityService) {
    throw new Error(`services.${name} does not exist`);
  }

  if (!entityMapper) {
    throw new Error(`mappers.${mapperName} does not exist`);
  }

  return {
    get: async (req) => {
      if (!entityService.get) {
        throw new Error(constants.METHOD_NOT_SUPPORTED);
      }
      let entity = await entityService.get(req.params.id, req.user);

      if (!entity) {
        return constants.ITEM_NOT_EXIST;
      }
      return entityMapper.toModel(entity, req.user);
    },
    search: async (req) => {
      if (!entityService.search) {
        throw new Error(constants.METHOD_NOT_SUPPORTED);
      }

      let page = extractPage(req);

      const entities = await entityService.search(req.query, page, req.user);

      let pagedItems = {
        items: entities.items.map((item) => {
          return (entityMapper.toSummary || entityMapper.toModel)(
            item,
            req.user
          );
        }),
        total: entities.count || entities.items.length,
      };

      if (page) {
        pagedItems.pageSize = page.limit;
        pagedItems.pageNo = page.pageNo;
      }

      return pagedItems;
    },
    update: async (req) => {
      if (!entityService.update) {
        throw new Error(constants.METHOD_NOT_SUPPORTED);
      }
      const entity = await entityService.update(
        req.params.id,
        req.body,
        req.user
      );
      return entityMapper.toModel(entity, req.user);
    },
    create: async (req) => {
      if (!entityService.create) {
        throw new Error(constants.METHOD_NOT_SUPPORTED);
      }
      const entity = await entityService.create(req.body, req.user);
      return entityMapper.toModel(entity, req.user);
    },
    delete: async (req) => {
      if (!entityService.remove) {
        throw new Error(constants.METHOD_NOT_SUPPORTED);
      }
      await entityService.remove(req.params.id);

      return constants.ITEM_REMOVED_SUCCESSFULLY;
    },
    extractPage,
  };
};  
